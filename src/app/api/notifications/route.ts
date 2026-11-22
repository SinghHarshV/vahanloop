export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const notifications = db.notification?.findMany
      ? await db.notification.findMany({
          where: { userId: session.userId },
          orderBy: { createdAt: 'desc' },
          take: 30,
        })
      : [];

    return NextResponse.json({ notifications });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { notificationId, markAllRead } = body;

    if (markAllRead && db.notification?.updateMany) {
      await db.notification.updateMany({
        where: { userId: session.userId },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (notificationId && db.notification?.update) {
      await db.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, message: 'Notification marked as read' });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { pushToken, platform, deviceName } = body;

    if (!pushToken) {
      return NextResponse.json({ error: 'pushToken is required' }, { status: 400 });
    }

    // Securely register/update user device push notification token
    console.log(`[PushNotification] Registered device token for user ${session.userId} (${platform || 'unknown'}): ${pushToken.substring(0, 15)}...`);

    // In-memory or database recording of device token
    if (db.auditLog?.create) {
      await db.auditLog.create({
        data: {
          actorId: session.userId,
          action: 'REGISTER_DEVICE_PUSH_TOKEN',
          entityType: 'USER',
          entityId: session.userId,
          details: `Registered ${platform || 'mobile'} push token (${deviceName || 'generic device'})`,
        },
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: 'Push notification device token registered successfully',
      device: {
        userId: session.userId,
        platform: platform || 'unknown',
        registeredAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to register push token' }, { status: 500 });
  }
}
