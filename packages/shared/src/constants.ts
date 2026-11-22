/**
 * VahanLoop Brand Colors & Global Constants
 */

export const THEME_COLORS = {
  // Brand Core
  navy: '#10243A',
  darkBlue: '#183B56',
  emerald: '#15966B',
  emeraldLight: '#DDF5E9',
  emeraldHover: '#0E7553',

  // Neutrals & Surfaces
  background: '#F7F8FA',
  cardBackground: '#FFFFFF',
  white: '#FFFFFF',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  // Typography
  textPrimary: '#17212B',
  textSecondary: '#667085',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  // Status & Semantics
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',

  // Accents
  amberBadge: '#FEF3C7',
  amberText: '#92400E',
  purpleBadge: '#EDE9FE',
  purpleText: '#6D28D9',
  blueBadge: '#E0F2FE',
  blueText: '#0369A1',
};

export const OPERATIONAL_CITIES = [
  'All Cities',
  'Bengaluru',
  'Delhi NCR',
  'Mumbai',
  'Hyderabad',
  'Pune',
  'Goa',
  'Jaipur',
  'Jabalpur',
] as const;

export const VEHICLE_CATEGORIES = [
  { id: 'ALL', label: 'All Vehicles', icon: 'grid' },
  { id: 'CAR', label: 'Cars', icon: 'car' },
  { id: 'BIKE', label: 'Bikes', icon: 'bike' },
  { id: 'SCOOTER', label: 'Scooters', icon: 'zap' },
] as const;

export const BOOKING_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Pending Host Acceptance', color: '#D97706', bg: '#FEF3C7' },
  ACCEPTED: { label: 'Accepted - Awaiting Payment', color: '#2563EB', bg: '#DBEAFE' },
  AWAITING_PAYMENT: { label: 'Payment Pending', color: '#2563EB', bg: '#DBEAFE' },
  CONFIRMED: { label: 'Confirmed & Reserved', color: '#059669', bg: '#D1FAE5' },
  ACTIVE: { label: 'Trip in Progress', color: '#7C3AED', bg: '#EDE9FE' },
  COMPLETED: { label: 'Completed', color: '#4B5563', bg: '#F3F4F6' },
  REJECTED: { label: 'Host Declined', color: '#DC2626', bg: '#FEE2E2' },
  CANCELLED: { label: 'Cancelled', color: '#9CA3AF', bg: '#F3F4F6' },
  EXPIRED: { label: 'Reservation Expired', color: '#9CA3AF', bg: '#F3F4F6' },
};
