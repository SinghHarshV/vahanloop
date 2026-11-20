export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { checkRateLimit } from '@/lib/rateLimit';
import { sendNotification } from '@/lib/notifications';

export async function POST(req: NextRequest) {
  try {
    const rateLimit = await checkRateLimit(req, 'sensitive');
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many password reset requests. Please try again later.' },
        { status: 429 }
      );
    }

    const { email } = await req.json().catch(() => ({}));
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await db.user.findUnique({ where: { email: normalizedEmail } });

    // Protect against user enumeration by returning generic response even if user is not found
    if (user) {
      const secret = process.env.JWT_SECRET || 'vahanloop_secret_vault';
      const expires = Math.floor(Date.now() / 1000) + 900; // 15 minutes
      // HMAC token includes passwordHash so changing password invalidates all existing tokens
      const token = crypto
        .createHmac('sha256', `${secret}:${user.passwordHash}`)
        .update(`${user.id}:${expires}`)
        .digest('hex');

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vahanloop.com';
      const resetUrl = `${appUrl}/login?resetToken=${token}&email=${encodeURIComponent(normalizedEmail)}&expires=${expires}`;

      await sendNotification(
        'PASSWORD_RESET',
        {
          userId: user.id,
          name: user.fullName,
          email: user.email,
        },
        { resetUrl }
      );

      await db.auditLog.create({
        data: {
          actorId: user.id,
          action: 'PASSWORD_RESET_REQUESTED',
          entityType: 'USER',
          entityId: user.id,
          details: 'Password reset link dispatched via email',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists with that email address, password reset instructions have been sent.',
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
