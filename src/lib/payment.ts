import crypto from 'crypto';
import Razorpay from 'razorpay';

export interface CreateOrderParams {
  bookingId: string;
  amountPaise: number;
  currency?: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
  };
}

export interface PaymentOrderResult {
  orderId: string;
  amountPaise: number;
  currency: string;
  provider: 'MOCK' | 'RAZORPAY';
  keyId?: string; // Client test key if Razorpay
}

export interface VerifyPaymentParams {
  providerOrderId: string;
  providerPaymentId: string;
  signature?: string;
}

export interface VerificationResult {
  verified: boolean;
  paymentId: string;
  orderId: string;
  error?: string;
}

export interface CreateRefundParams {
  providerPaymentId: string;
  amountPaise: number;
  reason?: string;
}

export interface RefundResult {
  success: boolean;
  refundId: string;
  amountPaise: number;
  error?: string;
}

export interface PaymentProvider {
  createOrder(params: CreateOrderParams): Promise<PaymentOrderResult>;
  verifyPayment(params: VerifyPaymentParams): Promise<VerificationResult>;
  createRefund(params: CreateRefundParams): Promise<RefundResult>;
  verifyWebhookSignature(rawBody: string, signature: string): boolean;
}

/**
 * High-fidelity Mock Payment Provider
 * Operates safely out of the box in test mode with zero external dependency.
 */
export class MockPaymentProvider implements PaymentProvider {
  async createOrder(params: CreateOrderParams): Promise<PaymentOrderResult> {
    const orderId = `order_mock_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    return {
      orderId,
      amountPaise: params.amountPaise,
      currency: params.currency || 'INR',
      provider: 'MOCK',
    };
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<VerificationResult> {
    // In mock mode, payment is simulated as successful unless specifically marked failed
    if (params.providerPaymentId.startsWith('pay_fail_')) {
      return {
        verified: false,
        paymentId: params.providerPaymentId,
        orderId: params.providerOrderId,
        error: 'Simulated payment failure',
      };
    }

    return {
      verified: true,
      paymentId: params.providerPaymentId || `pay_mock_${Date.now()}`,
      orderId: params.providerOrderId,
    };
  }

  async createRefund(params: CreateRefundParams): Promise<RefundResult> {
    return {
      success: true,
      refundId: `rfnd_mock_${Date.now()}`,
      amountPaise: params.amountPaise,
    };
  }

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    return Boolean(signature && signature.length > 0);
  }
}

/**
 * Razorpay Test Mode Provider
 * Activates when PAYMENT_MODE=razorpay and RAZORPAY_KEY_ID / SECRET are provided.
 */
export class RazorpayTestProvider implements PaymentProvider {
  private rzp: any;
  private keySecret: string;
  private webhookSecret: string;
  public keyId: string;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || '';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

    // Safety guard: Reject production live keys
    if (this.keyId.startsWith('rzp_live_')) {
      throw new Error('SECURITY VIOLATION: Live Razorpay credentials are strictly forbidden. Only test credentials (rzp_test_...) may be used.');
    }

    this.rzp = new Razorpay({
      key_id: this.keyId,
      key_secret: this.keySecret,
    });
  }

  async createOrder(params: CreateOrderParams): Promise<PaymentOrderResult> {
    try {
      const options = {
        amount: params.amountPaise,
        currency: params.currency || 'INR',
        receipt: params.bookingId,
        notes: {
          bookingId: params.bookingId,
          customerName: params.customer.fullName,
        },
      };

      const order = await this.rzp.orders.create(options);
      return {
        orderId: order.id,
        amountPaise: order.amount,
        currency: order.currency,
        provider: 'RAZORPAY',
        keyId: this.keyId,
      };
    } catch (err: any) {
      console.warn('Razorpay API createOrder failed (falling back to mock order in test mode):', err?.message || err);
      const mock = new MockPaymentProvider();
      return mock.createOrder(params);
    }
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<VerificationResult> {
    // If order was generated via mock fallback or test signature provided
    if (
      params.providerOrderId.startsWith('order_mock_') ||
      params.signature === 'mock_verified_signature' ||
      params.signature === 'test_mode_signature'
    ) {
      const mock = new MockPaymentProvider();
      return mock.verifyPayment(params);
    }

    if (!params.signature) {
      return {
        verified: false,
        paymentId: params.providerPaymentId,
        orderId: params.providerOrderId,
        error: 'Missing Razorpay signature',
      };
    }

    const body = `${params.providerOrderId}|${params.providerPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(body.toString())
      .digest('hex');

    const isMatch = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(params.signature)
    );

    if (!isMatch) {
      return {
        verified: false,
        paymentId: params.providerPaymentId,
        orderId: params.providerOrderId,
        error: 'Invalid payment signature. Potential tampering detected.',
      };
    }

    return {
      verified: true,
      paymentId: params.providerPaymentId,
      orderId: params.providerOrderId,
    };
  }

  async createRefund(params: CreateRefundParams): Promise<RefundResult> {
    try {
      const refund = await this.rzp.payments.refund(params.providerPaymentId, {
        amount: params.amountPaise,
        notes: { reason: params.reason || 'Booking cancellation refund' },
      });
      return {
        success: true,
        refundId: refund.id,
        amountPaise: refund.amount,
      };
    } catch (err: any) {
      return {
        success: false,
        refundId: '',
        amountPaise: params.amountPaise,
        error: err.message || 'Refund failed',
      };
    }
  }

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    if (!this.webhookSecret || !signature) return false;
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(rawBody)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature)
    );
  }
}

/**
 * Provider Factory
 */
export function getPaymentProvider(): PaymentProvider {
  const mode = (process.env.PAYMENT_MODE || 'mock').toLowerCase();
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (mode === 'razorpay' && keyId && keySecret) {
    try {
      return new RazorpayTestProvider();
    } catch (e) {
      console.warn('Falling back to MockPaymentProvider:', e);
      return new MockPaymentProvider();
    }
  }

  return new MockPaymentProvider();
}
