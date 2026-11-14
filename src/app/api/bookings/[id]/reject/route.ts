import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

interface RouteContext {
  params: { id: string };
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const booking = await db.booking.findUnique({ where: { id: params.id } });
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const isOwner = session.userId === booking.vehicle?.ownerId;
    const isAdmin = session.roles.includes('ADMIN');

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Only the vehicle partner can decline this request' },
        { status: 403 }
      );
    }

    if (booking.status !== 'REQUESTED' && booking.status !== 'AWAITING_PAYMENT') {
      return NextResponse.json(
        { error: `Cannot reject booking with status ${booking.status}` },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const reason = body.reason || 'Host vehicle unavailable for the requested window';

    const updated = await db.booking.update({
      where: { id: params.id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        _changedBy: session.userId,
      },
    });

    await db.auditLog.create({
      data: {
        actorId: session.userId,
        action: 'BOOKING_REJECTED',
        entityType: 'BOOKING',
        entityId: booking.id,
        details: `Booking declined by ${session.email}: ${reason}`,
      },
    });

    return NextResponse.json({
      message: 'Booking request rejected',
      booking: updated,
    });
  } catch (error: any) {
    console.error('Error rejecting booking:', error);
    return NextResponse.json({ error: 'Failed to reject booking' }, { status: 500 });
  }
}
