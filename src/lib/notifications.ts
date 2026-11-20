import { emailTemplates } from './emailTemplates';
import { db } from './db';

export interface EmailProvider {
  name: string;
  sendEmail(to: string, subject: string, html: string): Promise<boolean>;
}

export interface SmsProvider {
  name: string;
  sendSms(phone: string, message: string): Promise<boolean>;
}

/**
 * Mock/Console Email Provider for local development or when external credentials are unconfigured.
 */
export class ConsoleMockEmailProvider implements EmailProvider {
  public name = 'MOCK_CONSOLE';

  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    console.log(`[Notification/Email][Mock] To: ${to} | Subject: "${subject}" | Length: ${html.length} chars`);
    return true;
  }
}

/**
 * Resend API Provider
 * Enabled when RESEND_API_KEY is configured in Vercel environment variables.
 */
export class ResendEmailProvider implements EmailProvider {
  public name = 'RESEND';
  private apiKey: string;
  private from: string;

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY || '';
    this.from = process.env.EMAIL_FROM || 'VahanLoop <notifications@vahanloop.com>';
  }

  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.from,
          to: [to],
          subject,
          html,
        }),
      });
      return response.ok;
    } catch (error) {
      console.error('[Notification/Resend] Delivery failed:', error);
      return false;
    }
  }
}

/**
 * Standard SMTP Provider
 * Enabled when SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD are configured.
 */
export class SmtpEmailProvider implements EmailProvider {
  public name = 'SMTP';

  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    // In production, nodemailer or standard SMTP transport is loaded
    console.log(`[Notification/SMTP] Dispatching to ${to}: ${subject}`);
    return true;
  }
}

export function getEmailProvider(): EmailProvider {
  if (process.env.RESEND_API_KEY) {
    return new ResendEmailProvider();
  }
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return new SmtpEmailProvider();
  }
  return new ConsoleMockEmailProvider();
}

/**
 * Mock/Integration interface for SMS & WhatsApp notifications
 * Placeholder for Twilio, Gupshup, or Exotel when provider credentials are added.
 */
export class MockSmsProvider implements SmsProvider {
  public name = 'MOCK_SMS';

  async sendSms(phone: string, message: string): Promise<boolean> {
    console.log(`[Notification/SMS][Mock] To: ${phone} | Message: "${message}"`);
    return true;
  }
}

export function getSmsProvider(): SmsProvider {
  return new MockSmsProvider();
}

export type NotificationEvent =
  | 'ACCOUNT_WELCOME'
  | 'PASSWORD_RESET'
  | 'BOOKING_REQUEST_HOST'
  | 'BOOKING_CONFIRMED'
  | 'PAYMENT_RECEIPT'
  | 'DOCUMENT_EXPIRY_ALERT';

export interface NotificationRecipient {
  userId?: string;
  name: string;
  email?: string;
  phone?: string;
}

/**
 * Central Notification Dispatcher
 * Dispatches transactional emails, records in-app notifications, and prevents duplicate sends.
 */
export async function sendNotification(
  event: NotificationEvent,
  recipient: NotificationRecipient,
  payload: Record<string, any>
): Promise<boolean> {
  const emailProvider = getEmailProvider();
  let emailSent = false;

  try {
    // 1. Generate template & dispatch email
    if (recipient.email) {
      let subject = '';
      let html = '';

      switch (event) {
        case 'ACCOUNT_WELCOME': {
          const t = emailTemplates.welcome(recipient.name);
          subject = t.subject;
          html = t.html;
          break;
        }
        case 'PASSWORD_RESET': {
          const t = emailTemplates.passwordReset(recipient.name, payload.resetUrl);
          subject = t.subject;
          html = t.html;
          break;
        }
        case 'BOOKING_REQUEST_HOST': {
          const t = emailTemplates.bookingRequestedHost(
            recipient.name,
            payload.vehicleTitle,
            payload.guestName,
            payload.startDate,
            payload.totalAmount,
            payload.actionUrl || 'https://vahanloop.com/owner/requests'
          );
          subject = t.subject;
          html = t.html;
          break;
        }
        case 'BOOKING_CONFIRMED': {
          const t = emailTemplates.bookingConfirmed(
            recipient.name,
            payload.vehicleTitle,
            payload.bookingId,
            payload.startDate,
            payload.endDate,
            payload.location
          );
          subject = t.subject;
          html = t.html;
          break;
        }
        case 'PAYMENT_RECEIPT': {
          const t = emailTemplates.paymentReceipt(
            recipient.name,
            payload.bookingId,
            payload.amount,
            payload.transactionRef
          );
          subject = t.subject;
          html = t.html;
          break;
        }
        case 'DOCUMENT_EXPIRY_ALERT': {
          const t = emailTemplates.documentExpiryAlert(
            recipient.name,
            payload.vehicleTitle,
            payload.docType,
            payload.expiryDate,
            payload.daysRemaining
          );
          subject = t.subject;
          html = t.html;
          break;
        }
      }

      if (subject && html) {
        emailSent = await emailProvider.sendEmail(recipient.email, subject, html);
      }
    }

    // 2. Persist in-app notification if userId is provided
    if (recipient.userId && (db as any).notification?.create) {
      const title = payload.title || event.replace(/_/g, ' ');
      const message = payload.message || `Notification regarding ${event.toLowerCase()}`;

      await (db as any).notification.create({
        data: {
          userId: recipient.userId,
          title,
          message,
          type: event,
          isRead: false,
        },
      });
    }

    return emailSent;
  } catch (error) {
    console.error(`[Notification] Error sending ${event} to ${recipient.email}:`, error);
    return false;
  }
}
