export type UserRole = 'customer' | 'owner' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  avatar?: string;
  rating?: number;
  joinedDate: string;
}

export type VehicleCategory = 'car' | 'bike' | 'scooter';
export type FuelType = 'petrol' | 'diesel' | 'electric' | 'cng' | 'hybrid';
export type Transmission = 'manual' | 'automatic';
export type RentalType = 'self-drive' | 'with-driver';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type DocumentVerificationStatus = 'verified' | 'pending' | 'rejected';

export interface VehicleDocumentStatus {
  rc: DocumentVerificationStatus;
  insurance: DocumentVerificationStatus;
  puc: DocumentVerificationStatus;
  commercialAuthorisation: DocumentVerificationStatus;
}

export interface Review {
  id: string;
  vehicleId: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Vehicle {
  id: string;
  title: string;
  manufacturer: string;
  model: string;
  year: number;
  category: VehicleCategory;
  fuelType: FuelType;
  transmission: Transmission;
  seatingCapacity: number;
  location: string;
  dailyRate: number;
  driverChargePerDay?: number;
  minimumDurationDays: number;
  supportedModes: RentalType[];
  images: string[];
  description: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerRating: number;
  approvalStatus: ApprovalStatus;
  rejectionReason?: string;
  isActive: boolean;
  isAvailable: boolean;
  documents: VehicleDocumentStatus;
  rentalConditions: string[];
  features: string[];
  reviews: Review[];
  createdAt: string;
}

export type BookingStatus =
  | 'requested'
  | 'awaiting_payment'
  | 'confirmed'
  | 'rejected'
  | 'cancelled'
  | 'completed';

export interface SimulatedPayment {
  paidAt: string;
  method: string;
  transactionId: string;
  amount: number;
  status: 'simulated_success';
}

export interface Booking {
  id: string;
  vehicleId: string;
  vehicleTitle: string;
  vehicleImage: string;
  vehicleCategory: VehicleCategory;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  ownerId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  rentalType: RentalType;
  dailyRate: number;
  driverChargeTotal: number;
  serviceFee: number;
  securityDeposit: number;
  totalAmount: number;
  ownerEarnings: number;
  platformCommission: number;
  status: BookingStatus;
  paymentSimulated?: SimulatedPayment;
  rejectionReason?: string;
  createdAt: string;
}

export interface FilterState {
  category: VehicleCategory | 'all';
  searchQuery: string;
  location: string;
  rentalType: RentalType | 'all';
  fuelType: FuelType | 'all';
  transmission: Transmission | 'all';
  minPrice: number;
  maxPrice: number;
  sortBy: 'recommended' | 'price_low' | 'price_high' | 'rating';
}
