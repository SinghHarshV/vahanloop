export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { RESERVATION_HOLD_MINUTES } from '@/lib/bookingExpiry';

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

    // Atomic double-booking lock verification before accepting
    const conflictCheck = await db.$transaction(async (tx: any) => {
      const existing = await tx.booking.findMany({
        where: { vehicleId: booking.vehicleId },
      });

      const activeHoldingStatuses = ['ACCEPTED', 'AWAITING_PAYMENT', 'CONFIRMED', 'ACTIVE'];
      const bStart = new Date(booking.pickupDateTime).getTime();
      const bEnd = new Date(booking.returnDateTime).getTime();

      const hasConflict = existing.some((other: any) => {
        if (other.id === booking.id) return false;
        if (!activeHoldingStatuses.includes(other.status)) return false;
        const oStart = new Date(other.pickupDateTime).getTime();
        const oEnd = new Date(other.returnDateTime).getTime();
        return bStart < oEnd && bEnd > oStart;
      });

      if (hasConflict) {
        return { conflict: true };
      }

      // Calculate temporary hold expiry: current time + 15 minutes
      const expiresAt = new Date(Date.now() + RESERVATION_HOLD_MINUTES * 60 * 1000);

      const updated = await tx.booking.update({
        where: { id: params.id },
        data: {
          status: 'AWAITING_PAYMENT',
          expiresAt,
          _changedBy: session.userId,
        },
      });

      // Record status transition
      if (tx.bookingStatusHistory?.create) {
        await tx.bookingStatusHistory.create({
          data: {
            bookingId: booking.id,
            previousStatus: 'REQUESTED',
            newStatus: 'AWAITING_PAYMENT',
            changedBy: session.userId,
            note: `Host accepted request. 15-minute reservation hold set until ${expiresAt.toISOString()}`,
          },
        });
      }

      return { conflict: false, updated, expiresAt };
    });

    if (conflictCheck.conflict) {
      return NextResponse.json(
        {
          error:
            'Cannot accept request: Another overlapping reservation is already holding this vehicle.',
        },
        { status: 409 }
      );
    }

    // Send customer notification
    if (db.notification?.create) {
      await db.notification.create({
        data: {
          userId: booking.customerId,
          title: 'Booking Request Accepted!',
          message: `The host accepted your booking for ${booking.vehicle?.make || 'the vehicle'}. Please complete checkout within ${RESERVATION_HOLD_MINUTES} minutes to confirm.`,
          type: 'SUCCESS',
          link: '/bookings',
        },
      });
    }

    await db.auditLog.create({
      data: {
        actorId: session.userId,
        action: 'BOOKING_ACCEPTED',
        entityType: 'BOOKING',
        entityId: booking.id,
        details: `Booking accepted by host ${session.email}. Hold active for ${RESERVATION_HOLD_MINUTES}m until ${conflictCheck.expiresAt?.toISOString()}`,
      },
    });

    return NextResponse.json({
      message: `Booking request accepted. Vehicle held for ${RESERVATION_HOLD_MINUTES} minutes awaiting payment.`,
      booking: conflictCheck.updated,
      expiresAt: conflictCheck.expiresAt,
    });
  } catch (error: any) {
    console.error('Error accepting booking:', error);
    return NextResponse.json({ error: 'Failed to accept booking' }, { status: 500 });
  }
}
