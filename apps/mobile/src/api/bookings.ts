import { apiClient } from './client';
import { Booking, PricingQuote, RentalType } from '@vahanloop/shared';

export interface CreateBookingParams {
  vehicleId: string;
  rentalType: RentalType;
  pickupDateTime: string;
  returnDateTime: string;
  pickupLocation: string;
  dropLocation: string;
}

export interface QuoteParams {
  vehicleId: string;
  rentalType: RentalType;
  pickupDateTime: string;
  returnDateTime: string;
}

export async function getPricingQuote(params: QuoteParams): Promise<PricingQuote> {
  const res = await apiClient<{ quote: PricingQuote }>('/api/pricing/quote', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  return res.quote;
}

export async function createBooking(params: CreateBookingParams): Promise<Booking> {
  const res = await apiClient<{ booking: Booking }>('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  return res.booking;
}

export async function getCustomerBookings(status?: string): Promise<Booking[]> {
  const res = await apiClient<{ bookings: Booking[] }>('/api/bookings', {
    params: status ? { status } : undefined,
  });
  return res.bookings || [];
}

export async function getBookingDetails(id: string): Promise<Booking> {
  const res = await apiClient<{ booking: Booking }>(`/api/bookings/${id}`);
  return res.booking;
}

export async function createPaymentOrder(bookingId: string): Promise<{
  orderId: string;
  amountPaise: number;
  amountInr: number;
  currency: string;
  provider: 'MOCK' | 'RAZORPAY';
  keyId?: string;
}> {
  return apiClient(`/api/bookings/${bookingId}/create-payment-order`, {
    method: 'POST',
  });
}

export async function verifyPayment(
  bookingId: string,
  params: { providerOrderId: string; providerPaymentId: string; signature?: string }
): Promise<{ success: boolean; message: string; booking: Booking }> {
  return apiClient(`/api/bookings/${bookingId}/verify-payment`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function simulatePayment(
  bookingId: string,
  method: 'UPI' | 'CARD' | 'NETBANKING'
): Promise<{ success: boolean; booking: Booking }> {
  return apiClient(`/api/bookings/${bookingId}/simulate-payment`, {
    method: 'POST',
    body: JSON.stringify({ paymentMethod: method }),
  });
}

export async function cancelBooking(bookingId: string, reason?: string): Promise<{ success: boolean; booking: Booking }> {
  return apiClient(`/api/bookings/${bookingId}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason: reason || 'Customer requested cancellation' }),
  });
}
