import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim().toLowerCase() : val),
    z.string().email('Please enter a valid email address')
  ),
  phone: z.preprocess(
    (val) => (typeof val === 'string' ? val.replace(/[\s\-()]/g, '') : val),
    z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number cannot exceed 15 digits')
  ),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.preprocess(
    (val) => (typeof val === 'string' ? val.toUpperCase() : val),
    z.enum(['CUSTOMER', 'OWNER'])
  ).default('CUSTOMER'),
  ownerType: z.enum(['INDIVIDUAL', 'BUSINESS']).optional(),
  businessName: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim().toLowerCase() : val),
    z.string().email('Please enter a valid email address')
  ),
  password: z.string().min(1, 'Password is required'),
});

export const vehicleCreateSchema = z.object({
  category: z.enum(['CAR', 'BIKE', 'SCOOTER']),
  make: z.string().min(1, 'Manufacturer/Make is required'),
  model: z.string().min(1, 'Model name is required'),
  registrationNumber: z.string().min(4, 'Valid registration number is required'),
  manufacturingYear: z.number().int().min(2010).max(2027),
  fuelType: z.enum(['PETROL', 'DIESEL', 'ELECTRIC', 'CNG', 'HYBRID']).default('PETROL'),
  transmission: z.enum(['MANUAL', 'AUTOMATIC']).default('MANUAL'),
  seatingCapacity: z.number().int().min(1).max(10).default(5),
  description: z.string().optional(),
  location: z.string().min(2, 'Handover location is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  dailyRentalPrice: z.number().positive('Daily price must be positive'),
  driverCharge: z.number().nonnegative().optional().default(0),
  selfDriveEnabled: z.boolean().default(true),
  chauffeurEnabled: z.boolean().default(false),
  images: z.array(z.string().url()).min(1, 'At least one photo URL is required'),
});

export const vehicleUpdateSchema = vehicleCreateSchema.partial();

export const bookingCreateSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle ID is required'),
  rentalType: z.enum(['SELF_DRIVE', 'CHAUFFEUR']).default('SELF_DRIVE'),
  pickupDateTime: z.string().datetime(),
  returnDateTime: z.string().datetime(),
  pickupLocation: z.string().min(2, 'Pickup location is required'),
  dropLocation: z.string().min(2, 'Drop location is required'),
});

export const bookingActionSchema = z.object({
  reason: z.string().optional(),
  paymentMethod: z.enum(['UPI', 'CARD', 'NETBANKING', 'SIMULATED']).optional(),
});
