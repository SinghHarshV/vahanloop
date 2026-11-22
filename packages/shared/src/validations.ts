import { z } from 'zod';

export const mobileLoginSchema = z.object({
  email: z.preprocess(
    (val) => (typeof val === 'string' ? val.trim().toLowerCase() : val),
    z.string().email('Please enter a valid email address')
  ),
  password: z.string().min(1, 'Password is required'),
});

export const mobileRegisterSchema = z.object({
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

export const mobileBookingSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle ID is required'),
  rentalType: z.enum(['SELF_DRIVE', 'CHAUFFEUR']).default('SELF_DRIVE'),
  pickupDateTime: z.string(),
  returnDateTime: z.string(),
  pickupLocation: z.string().min(2, 'Pickup location is required'),
  dropLocation: z.string().min(2, 'Drop location is required'),
});

export const mobileAddVehicleSchema = z.object({
  category: z.enum(['CAR', 'BIKE', 'SCOOTER']),
  make: z.string().min(1, 'Manufacturer is required'),
  model: z.string().min(1, 'Model name is required'),
  year: z.number().int().min(2010).max(2027),
  registrationNumber: z.string().min(4, 'Registration plate is required'),
  fuelType: z.enum(['PETROL', 'DIESEL', 'ELECTRIC', 'CNG', 'HYBRID']),
  transmission: z.enum(['MANUAL', 'AUTOMATIC']),
  seatingCapacity: z.number().int().min(1).max(10).default(5),
  location: z.string().min(2, 'Depot location is required'),
  dailyRentalPrice: z.number().positive('Daily price must be positive'),
  driverCharge: z.number().nonnegative().default(0),
  selfDriveEnabled: z.boolean().default(true),
  chauffeurEnabled: z.boolean().default(false),
  description: z.string().optional(),
});
