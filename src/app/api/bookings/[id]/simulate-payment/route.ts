export const dynamic = 'force-dynamic';
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

    // Only the customer who placed the booking or admin can pay
    const isCustomer = session.userId === booking.customerId;
    const isAdmin = session.roles.includes('ADMIN');

    if (!isCustomer && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: You can only simulate payment for your own booking' },
        { status: 403 }
      );
    }

    if (booking.status !== 'AWAITING_PAYMENT' && booking.status !== 'ACCEPTED') {
      return NextResponse.json(
        {
          error: `Cannot pay for booking in status "${booking.status}". Only accepted bookings can be paid.`,
        },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const paymentMethod = body.paymentMethod || 'UPI';

    // Atomic transaction for payment simulation and final collision check
    const result = await db.$transaction(async (tx: any) => {
      // Re-check conflict to prevent race condition if two bookings were accepted for the same dates
      const existingConfirmed = await tx.booking.findMany({
        where: { vehicleId: booking.vehicleId },
      });

      const bStart = new Date(booking.pickupDateTime).getTime();
      const bEnd = new Date(booking.returnDateTime).getTime();

      const conflict = existingConfirmed.some((other: any) => {
        if (other.id === booking.id) return false;
        if (other.status !== 'CONFIRMED' && other.status !== 'ACTIVE') return false;
        const oStart = new Date(other.pickupDateTime).getTime();
        const oEnd = new Date(other.returnDateTime).getTime();
        return bStart <= oEnd && bEnd >= oStart;
      });

      if (conflict) {
        return {
          conflict: true,
          error:
            'Another reservation for this vehicle was already confirmed for the requested dates.',
        };
      }

      const txRef = `TXN-VL-${Math.floor(100000 + Math.random() * 900000)}-DEMO`;

      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          amount: booking.totalAmount,
          paymentMethod,
          paymentStatus: 'COMPLETED',
          transactionReference: txRef,
        },
      });

      const updatedBooking = await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: 'CONFIRMED',
          _changedBy: session.userId,
        },
      });

      return { conflict: false, booking: updatedBooking, payment };
    });

    if (result.conflict) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    await db.auditLog.create({
      data: {
        actorId: session.userId,
        action: 'PAYMENT_SIMULATED',
        entityType: 'PAYMENT',
        entityId: result.payment.id,
        details: `Simulated ₹${booking.totalAmount} payment for booking ${booking.id} (${result.payment.transactionReference})`,
      },
    });

    return NextResponse.json({
      message: 'Payment simulation successful. Booking is now Confirmed!',
      booking: result.booking,
      payment: result.payment,
    });
  } catch (error: any) {
    console.error('Error simulating payment:', error);
    return NextResponse.json(
      { error: 'Internal server error simulating payment' },
      { status: 500 }
    );
  }
}
