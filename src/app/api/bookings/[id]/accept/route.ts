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

    // Only the vehicle owner or an admin can accept
    const isOwner = session.userId === booking.vehicle?.ownerId;
    const isAdmin = session.roles.includes('ADMIN');

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Only the vehicle partner can accept this booking request' },
        { status: 403 }
      );
    }

    // Status validation
    if (booking.status !== 'REQUESTED') {
      return NextResponse.json(
        { error: `Cannot accept booking in current status: ${booking.status}` },
        { status: 400 }
      );
    }

    const updated = await db.booking.update({
      where: { id: params.id },
      data: {
        status: 'AWAITING_PAYMENT',
        _changedBy: session.userId,
      },
    });

    await db.auditLog.create({
      data: {
        actorId: session.userId,
        action: 'BOOKING_ACCEPTED',
        entityType: 'BOOKING',
        entityId: booking.id,
        details: `Booking accepted by host ${session.email}. Status set to AWAITING_PAYMENT`,
      },
    });

    return NextResponse.json({
      message: 'Booking request accepted. Customer can now simulate checkout payment.',
      booking: updated,
    });
  } catch (error: any) {
    console.error('Error accepting booking:', error);
    return NextResponse.json({ error: 'Failed to accept booking' }, { status: 500 });
  }
}
