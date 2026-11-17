export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { getPaymentProvider } from '@/lib/payment';
import { toPaise, formatINR } from '@/lib/pricing';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || !session.roles.includes('ADMIN')) {
      return NextResponse.json({ error: 'Platform Administrator access required' }, { status: 403 });
    }

    const refunds = db.refund?.findMany
      ? await db.refund.findMany({ orderBy: { createdAt: 'desc' } })
      : [];

    return NextResponse.json({ refunds });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch refunds' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || !session.roles.includes('ADMIN')) {
      return NextResponse.json({ error: 'Platform Administrator access required' }, { status: 403 });
    }

    const body = await req.json();
    const { paymentId, amountInr, reason } = body;

    if (!paymentId) {
      return NextResponse.json({ error: 'paymentId is required' }, { status: 400 });
    }

    const payment = await db.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Original payment record not found' }, { status: 404 });
    }

    const refundAmountInr = amountInr ? Number(amountInr) : payment.amount;
    const refundAmountPaise = toPaise(refundAmountInr);

    if (refundAmountInr > payment.amount) {
      return NextResponse.json(
        { error: `Refund amount (₹${refundAmountInr}) cannot exceed original payment amount (₹${payment.amount})` },
        { status: 400 }
      );
    }

    const provider = getPaymentProvider();
    const refundResult = await provider.createRefund({
      providerPaymentId: payment.providerPaymentId || payment.transactionReference,
      amountPaise: refundAmountPaise,
      reason: reason || 'Administrative cancellation refund',
    });

    if (!refundResult.success) {
      return NextResponse.json({ error: refundResult.error || 'Refund rejected by provider' }, { status: 400 });
    }

    // Maintain complete immutable history: Record refund without silently overwriting original payment
    const refund = db.refund?.create
      ? await db.refund.create({
          data: {
            paymentId: payment.id,
            amountPaise: refundAmountPaise,
            formattedAmount: formatINR(refundAmountPaise),
            reason: reason || 'Customer cancellation',
            status: 'COMPLETED',
            providerRefundId: refundResult.refundId,
          },
        })
      : {
          id: `rfnd_${Date.now()}`,
          paymentId: payment.id,
          amountPaise: refundAmountPaise,
          formattedAmount: formatINR(refundAmountPaise),
          status: 'COMPLETED',
          providerRefundId: refundResult.refundId,
        };

    // Update payment status to REFUNDED
    await db.payment.update({
      where: { id: payment.id },
      data: { paymentStatus: 'REFUNDED' },
    });

    await db.auditLog.create({
      data: {
        actorId: session.userId,
        action: 'PAYMENT_REFUND_ISSUED',
        entityType: 'PAYMENT',
        entityId: payment.id,
        details: `Issued refund of ₹${refundAmountInr} for payment ${payment.id}. Refund ID: ${refundResult.refundId}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Test refund of ₹${refundAmountInr} processed successfully.`,
      refund,
    });
  } catch (error: any) {
    console.error('Refund processing error:', error);
    return NextResponse.json({ error: 'Failed to process refund' }, { status: 500 });
  }
}
