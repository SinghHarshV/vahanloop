export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const rateLimit = await checkRateLimit(req, 'sensitive');
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many attempts. Please wait before retrying.' },
        { status: 429 }
      );
    }

    const { email, token, expires, newPassword } = await req.json().catch(() => ({}));

    if (!email || !token || !expires || !newPassword) {
      return NextResponse.json(
        { error: 'Missing required password reset parameters.' },
        { status: 400 }
      );
    }

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    // Check expiration
    const expiryTimestamp = Number(expires);
    const now = Math.floor(Date.now() / 1000);
    if (isNaN(expiryTimestamp) || now > expiryTimestamp) {
      return NextResponse.json(
        { error: 'Password reset link has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await db.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired password reset token.' },
        { status: 400 }
      );
    }

    // Verify token signature against current passwordHash
    const secret = process.env.JWT_SECRET || 'vahanloop_secret_vault';
    const expectedToken = crypto
      .createHmac('sha256', `${secret}:${user.passwordHash}`)
      .update(`${user.id}:${expiryTimestamp}`)
      .digest('hex');

    const isValidToken = crypto.timingSafeEqual(
      Buffer.from(expectedToken),
      Buffer.from(String(token))
    );

    if (!isValidToken) {
      return NextResponse.json(
        { error: 'Invalid or manipulated password reset token.' },
        { status: 400 }
      );
    }

    // Hash and update password
    const newHash = await hashPassword(newPassword);
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash, updatedAt: new Date() },
    });

    await db.auditLog.create({
      data: {
        actorId: user.id,
        action: 'PASSWORD_RESET_COMPLETED',
        entityType: 'USER',
        entityId: user.id,
        details: 'Password was updated successfully via secure reset link',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Your password has been successfully reset. You may now log in with your new password.',
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
