export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getPaymentProvider } from '@/lib/payment';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';

    const provider = getPaymentProvider();

    // 1. Verify signature
    const isSignatureValid = provider.verifyWebhookSignature(rawBody, signature);
    if (!isSignatureValid && process.env.PAYMENT_MODE === 'razorpay') {
      console.warn('Webhook signature verification failed');
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const eventId = payload.event_id || payload.id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const eventType = payload.event || 'payment.captured';

    // 2. Idempotency Check: Prevent duplicate processing of repeated webhooks
    if (db.paymentWebhookEvent) {
      const existingEvent = await db.paymentWebhookEvent.findUnique({
        where: { eventId },
      });

      if (existingEvent) {
        return NextResponse.json({
          status: 'ok',
          message: 'Webhook event already processed (idempotent)',
        });
      }

      await db.paymentWebhookEvent.create({
        data: {
          eventId,
          eventType,
          provider: 'RAZORPAY',
          signatureVerified: isSignatureValid,
          processingStatus: 'PROCESSED',
          payloadReference: JSON.stringify(payload).slice(0, 500),
        },
      });
    }

    // 3. Process event types
    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const entity = payload.payload?.payment?.entity || payload.payload?.order?.entity || {};
      const bookingId = entity.notes?.bookingId || entity.receipt;

      if (bookingId) {
        const booking = await db.booking.findUnique({ where: { id: bookingId } });
        if (booking && booking.status !== 'CONFIRMED') {
          await db.booking.update({
            where: { id: bookingId },
            data: { status: 'CONFIRMED', expiresAt: null },
          });

          await db.payment.create({
            data: {
              bookingId,
              provider: 'RAZORPAY',
              providerOrderId: entity.order_id || 'order_webhook',
              providerPaymentId: entity.id || 'pay_webhook',
              amount: (entity.amount || 0) / 100,
              amountPaise: entity.amount || 0,
              currency: entity.currency || 'INR',
              paymentMethod: entity.method || 'WEBHOOK',
              paymentStatus: 'COMPLETED',
              transactionReference: `TXN-VL-WH-${Date.now().toString().slice(-6)}`,
            },
          });
        }
      }
    } else if (eventType === 'payment.failed') {
      const entity = payload.payload?.payment?.entity || {};
      const bookingId = entity.notes?.bookingId;
      if (bookingId) {
        await db.auditLog.create({
          data: {
            action: 'WEBHOOK_PAYMENT_FAILED',
            entityType: 'BOOKING',
            entityId: bookingId,
            details: `Webhook reported failed payment: ${entity.error_description || 'Unknown reason'}`,
          },
        });
      }
    }

    return NextResponse.json({ status: 'ok', received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
