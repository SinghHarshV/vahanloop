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

    const isCustomer = session.userId === booking.customerId;
    const isAdmin = session.roles.includes('ADMIN');

    if (!isCustomer && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to cancel this booking' },
        { status: 403 }
      );
    }

    if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
      return NextResponse.json(
        { error: `Booking is already ${booking.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    const updated = await db.booking.update({
      where: { id: params.id },
      data: {
        status: 'CANCELLED',
        _changedBy: session.userId,
      },
    });

    await db.auditLog.create({
      data: {
        actorId: session.userId,
        action: 'BOOKING_CANCELLED',
        entityType: 'BOOKING',
        entityId: booking.id,
        details: `Booking cancelled by ${session.email}`,
      },
    });

    return NextResponse.json({
      message: 'Booking cancelled successfully',
      booking: updated,
    });
  } catch (error: any) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 });
  }
}
