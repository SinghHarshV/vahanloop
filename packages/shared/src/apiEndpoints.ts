/**
 * VahanLoop API Endpoints Contract
 */

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  ME: '/api/auth/me',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  RESET_PASSWORD: '/api/auth/reset-password',

  // Vehicles
  VEHICLES: '/api/vehicles',
  VEHICLE_DETAILS: (id: string) => `/api/vehicles/${id}`,
  VEHICLE_ELIGIBILITY: (id: string) => `/api/vehicles/${id}/eligibility`,

  // Pricing
  PRICING_QUOTE: '/api/pricing/quote',

  // Bookings
  BOOKINGS: '/api/bookings',
  BOOKING_DETAILS: (id: string) => `/api/bookings/${id}`,
  BOOKING_CREATE_PAYMENT_ORDER: (id: string) => `/api/bookings/${id}/create-payment-order`,
  BOOKING_VERIFY_PAYMENT: (id: string) => `/api/bookings/${id}/verify-payment`,
  BOOKING_SIMULATE_PAYMENT: (id: string) => `/api/bookings/${id}/simulate-payment`,
  BOOKING_CANCEL: (id: string) => `/api/bookings/${id}/cancel`,
  BOOKING_ACCEPT: (id: string) => `/api/bookings/${id}/accept`,
  BOOKING_REJECT: (id: string) => `/api/bookings/${id}/reject`,

  // Owner
  OWNER_DASHBOARD: '/api/owner/dashboard',
  OWNER_VEHICLES: '/api/owner/vehicles',
  OWNER_BOOKINGS: '/api/owner/bookings',
  OWNER_EARNINGS: '/api/owner/earnings',
  OWNER_ONBOARDING: '/api/owner/onboarding',

  // Drivers
  DRIVERS: '/api/drivers',
  DRIVER_ASSIGNMENTS: '/api/drivers/assignments',

  // Operations
  HANDOVER: '/api/operations/handover',
  RETURN: '/api/operations/return',
  INCIDENTS: '/api/incidents',

  // Notifications
  NOTIFICATIONS: '/api/notifications',

  // Storage
  DOCUMENT_UPLOAD: '/api/documents/upload',
  DOCUMENT_DOWNLOAD: (fileKey: string) => `/api/documents/download/${fileKey}`,

  // System
  HEALTH: '/api/health',
};
