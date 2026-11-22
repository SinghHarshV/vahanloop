/**
 * VahanLoop Shared Domain & API Contracts
 */

export type UserRoleType = 'CUSTOMER' | 'OWNER' | 'DRIVER' | 'ADMIN';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  roles: UserRoleType[];
  accountStatus: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  avatar?: string;
  ownerProfile?: {
    id: string;
    ownerType: 'INDIVIDUAL' | 'BUSINESS';
    businessName?: string | null;
    verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  } | null;
  driverProfile?: {
    id: string;
    licenseNumber: string;
    badgeNumber?: string | null;
    verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
    availabilityStatus: 'AVAILABLE' | 'ON_DUTY' | 'OFF_DUTY';
  } | null;
  createdAt?: string;
}

export type VehicleCategory = 'CAR' | 'BIKE' | 'SCOOTER';
export type FuelType = 'PETROL' | 'DIESEL' | 'ELECTRIC' | 'CNG' | 'HYBRID';
export type Transmission = 'MANUAL' | 'AUTOMATIC';
export type RentalType = 'SELF_DRIVE' | 'CHAUFFEUR';
export type VehicleStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type AvailabilityStatus = 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'UNAVAILABLE';

export interface Vehicle {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  category: VehicleCategory;
  fuelType: FuelType;
  transmission: Transmission;
  seatingCapacity: number;
  location: string;
  latitude?: number;
  longitude?: number;
  dailyPrice: number;
  driverCharge: number;
  selfDriveEnabled: boolean;
  chauffeurEnabled: boolean;
  images: string[];
  description?: string;
  ownerId: string;
  ownerName?: string;
  ownerRating?: number;
  approvalStatus: VehicleStatus;
  availabilityStatus: AvailabilityStatus;
  isActive: boolean;
  rating?: number;
  tripsCount?: number;
  features?: string[];
  createdAt?: string;
}

export type BookingStatus =
  | 'PENDING'
  | 'AWAITING_PAYMENT'
  | 'ACCEPTED'
  | 'CONFIRMED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface Booking {
  id: string;
  vehicleId: string;
  vehicle?: Vehicle;
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  ownerId: string;
  pickupDateTime: string;
  returnDateTime: string;
  pickupLocation: string;
  dropLocation: string;
  rentalType: RentalType;
  baseAmount: number;
  driverCharge: number;
  serviceFee: number;
  depositAmount: number;
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED' | 'FAILED';
  rejectionReason?: string;
  cancellationReason?: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface PricingQuote {
  durationDays: number;
  dailyRate: number;
  baseAmount: number;
  driverChargePerDay: number;
  totalDriverCharge: number;
  serviceFee: number;
  depositAmount: number;
  totalAmount: number;
  currency: string;
}

export interface DriverAssignment {
  id: string;
  bookingId: string;
  booking?: Booking;
  driverId: string;
  status: 'ASSIGNED' | 'EN_ROUTE' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  assignedAt: string;
  pickupLocation: string;
  dropLocation: string;
  pickupDateTime: string;
  customerName: string;
  customerPhone: string;
  vehicleTitle: string;
  vehiclePlate: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'BOOKING' | 'PAYMENT' | 'COMPLIANCE' | 'SYSTEM' | 'SECURITY';
  isRead: boolean;
  data?: Record<string, any>;
  createdAt: string;
}

export interface OwnerEarningsSummary {
  totalRevenue: number;
  netEarnings: number;
  platformFees: number;
  pendingPayouts: number;
  completedBookingsCount: number;
  monthlyBreakdown: { month: string; amount: number }[];
}

export interface HandoverRecord {
  bookingId: string;
  odometerReading: number;
  fuelLevelPercent: number;
  exteriorCondition: 'CLEAN' | 'SCRATCHES' | 'DIRTY';
  photos: string[];
  signatureName: string;
  notes?: string;
}
