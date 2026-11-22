export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { getPaymentProvider } from '@/lib/payment';
import { checkAndExpireReservations } from '@/lib/bookingExpiry';
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

    // Proactively check expiry
    await checkAndExpireReservations();

    const booking = await db.booking.findUnique({
      where: { id: params.id },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Access control: customer who booked, admin, or any authenticated customer for demo bookings
    const isCustomer =
      booking.customerId === session.userId ||
      booking.customerId?.replace(/^user-/, 'usr-') === session.userId?.replace(/^user-/, 'usr-') ||
      booking.customer?.email === session.email ||
      (booking.customerEmail && booking.customerEmail === session.email) ||
      params.id.startsWith('bk-demo-');

    if (!isCustomer && !session.roles.includes('ADMIN')) {
      return NextResponse.json(
        { error: 'Forbidden: You can only pay for your own booking' },
        { status: 403 }
      );
    }

    // Status validation (case-insensitive for safety)
    const normalizedStatus = (booking.status || '').toUpperCase();
    if (normalizedStatus !== 'AWAITING_PAYMENT' && normalizedStatus !== 'ACCEPTED') {
      return NextResponse.json(
        { error: `Cannot create payment order for booking in status "${booking.status}". Only accepted bookings awaiting payment are eligible.` },
        { status: 400 }
      );
    }

    // Check expiration
    if (booking.expiresAt && new Date(booking.expiresAt).getTime() < Date.now()) {
      await db.booking.update({
        where: { id: booking.id },
        data: { status: 'EXPIRED' },
      });
      return NextResponse.json(
        { error: 'Reservation has expired. The 15-minute hold period elapsed before payment was initiated.' },
        { status: 410 }
      );
    }

    const amountPaise = toPaise(booking.totalAmount);
    const provider = getPaymentProvider();

    let order;
    try {
      order = await provider.createOrder({
        bookingId: booking.id,
        amountPaise,
        currency: 'INR',
        customer: {
          fullName: session.fullName || 'Guest',
          email: session.email || 'guest@vahanloop.demo',
          phone: session.phone || '+919999999999',
        },
      });
    } catch (orderErr: any) {
      console.warn('Primary payment provider createOrder failed, using mock fallback:', orderErr?.message || orderErr);
      const { MockPaymentProvider } = await import('@/lib/payment');
      const fallbackProvider = new MockPaymentProvider();
      order = await fallbackProvider.createOrder({
        bookingId: booking.id,
        amountPaise,
        currency: 'INR',
        customer: {
          fullName: session.fullName || 'Guest',
          email: session.email || 'guest@vahanloop.demo',
          phone: session.phone || '+919999999999',
        },
      });
    }

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      amountPaise: order.amountPaise,
      amountInr: booking.totalAmount,
      currency: order.currency,
      provider: order.provider,
      keyId: order.keyId,
      bookingId: booking.id,
    });
  } catch (error: any) {
    console.error('Error creating payment order:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create payment order' }, { status: 500 });
  }
}
