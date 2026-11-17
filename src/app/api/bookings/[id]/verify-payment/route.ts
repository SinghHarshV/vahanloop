export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { getPaymentProvider } from '@/lib/payment';
import { toPaise } from '@/lib/pricing';

interface RouteContext {
  params: { id: string };
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const booking = await db.booking.findUnique({
      where: { id: params.id },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.customerId !== session.userId && !session.roles.includes('ADMIN')) {
      return NextResponse.json(
        { error: 'Forbidden: You can only confirm your own booking' },
        { status: 403 }
      );
    }

    if (booking.status === 'CONFIRMED') {
      return NextResponse.json({ message: 'Booking is already confirmed', booking });
    }

    if (booking.status !== 'AWAITING_PAYMENT' && booking.status !== 'ACCEPTED') {
      return NextResponse.json(
        { error: `Cannot verify payment for booking in status "${booking.status}"` },
        { status: 400 }
      );
    }

    // Expiry verification
    if (booking.expiresAt && new Date(booking.expiresAt).getTime() < Date.now()) {
      await db.booking.update({
        where: { id: booking.id },
        data: { status: 'EXPIRED' },
      });
      return NextResponse.json(
        { error: 'Reservation has expired. Vehicle was released.' },
        { status: 410 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { providerOrderId, providerPaymentId, signature, paymentMethod } = body;

    const provider = getPaymentProvider();

    // Server-side cryptographic signature verification
    const verification = await provider.verifyPayment({
      providerOrderId: providerOrderId || `order_${booking.id}`,
      providerPaymentId: providerPaymentId || `pay_${Date.now()}`,
      signature,
    });

    if (!verification.verified) {
      return NextResponse.json(
        { error: verification.error || 'Payment signature verification failed' },
        { status: 400 }
      );
    }

    const amountPaise = toPaise(booking.totalAmount);
    const txnRef = `TXN-VL-${Math.floor(10000 + Math.random() * 90000)}-${Date.now().toString().slice(-4)}`;

    // Final atomic conflict check & confirmation transaction
    const result = await db.$transaction(async (tx: any) => {
      const existing = await tx.booking.findMany({
        where: { vehicleId: booking.vehicleId },
      });

      const bStart = new Date(booking.pickupDateTime).getTime();
      const bEnd = new Date(booking.returnDateTime).getTime();

      const conflict = existing.some((other: any) => {
        if (other.id === booking.id) return false;
        if (other.status !== 'CONFIRMED' && other.status !== 'ACTIVE') return false;
        const oStart = new Date(other.pickupDateTime).getTime();
        const oEnd = new Date(other.returnDateTime).getTime();
        return bStart < oEnd && bEnd > oStart;
      });

      if (conflict) {
        return { conflict: true };
      }

      const updatedBooking = await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: 'CONFIRMED',
          expiresAt: null, // Clear hold expiry
        },
      });

      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          provider: provider.constructor.name.includes('Razorpay') ? 'RAZORPAY' : 'MOCK',
          providerOrderId: verification.orderId,
          providerPaymentId: verification.paymentId,
          amount: booking.totalAmount,
          amountPaise,
          currency: 'INR',
          paymentMethod: paymentMethod || 'UPI',
          paymentStatus: 'COMPLETED',
          transactionReference: txnRef,
        },
      });

      if (tx.bookingStatusHistory?.create) {
        await tx.bookingStatusHistory.create({
          data: {
            bookingId: booking.id,
            previousStatus: booking.status,
            newStatus: 'CONFIRMED',
            changedBy: session.userId,
            note: `Payment verified (${payment.provider}). Transaction: ${txnRef}`,
          },
        });
      }

      return { conflict: false, updatedBooking, payment };
    });

    if (result.conflict) {
      return NextResponse.json(
        { error: 'Conflict: This vehicle was already confirmed by another customer.' },
        { status: 409 }
      );
    }

    // Notifications
    if (db.notification?.create) {
      await db.notification.create({
        data: {
          userId: booking.customerId,
          title: 'Payment Successful – Booking Confirmed!',
          message: `Your reservation for ${booking.vehicle?.make || 'the vehicle'} is confirmed. Ref: ${txnRef}`,
          type: 'SUCCESS',
          link: '/bookings',
        },
      });

      if (booking.vehicle?.ownerId) {
        await db.notification.create({
          data: {
            userId: booking.vehicle.ownerId,
            title: 'Guest Completed Payment',
            message: `Booking ${booking.id} is now confirmed. Estimated earnings: ₹${Math.round(booking.totalAmount * 0.9)}`,
            type: 'SUCCESS',
            link: '/owner/bookings',
          },
        });
      }
    }

    await db.auditLog.create({
      data: {
        actorId: session.userId,
        action: 'PAYMENT_VERIFIED_BOOKING_CONFIRMED',
        entityType: 'BOOKING',
        entityId: booking.id,
        details: `Payment of ₹${booking.totalAmount} verified via ${result.payment.provider}. Ref: ${txnRef}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully. Booking is now CONFIRMED.',
      booking: result.updatedBooking,
      payment: result.payment,
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}
