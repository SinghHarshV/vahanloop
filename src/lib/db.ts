import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  dbStore: any | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Flag to track whether PostgreSQL is connected
let isPostgresAvailable: boolean | null = null;

export async function checkPostgresConnection(): Promise<boolean> {
  if (isPostgresAvailable !== null) return isPostgresAvailable;
  try {
    // 1-second timeout probe
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), 1200)),
    ]);
    isPostgresAvailable = true;
    return true;
  } catch {
    isPostgresAvailable = false;
    return false;
  }
}

// Fallback high-fidelity in-memory relational store for environments without active Docker/Postgres
export function getInitialSeedData() {
  const passwordHash = bcrypt.hashSync('Demo@123456', 10);

  const users = [
    {
      id: 'usr-customer-1',
      fullName: 'Rahul Sharma',
      email: 'customer@vahanloop.demo',
      phone: '+919876543210',
      passwordHash,
      accountStatus: 'ACTIVE',
      createdAt: new Date('2024-01-15T10:00:00Z'),
      updatedAt: new Date('2024-01-15T10:00:00Z'),
      roles: ['CUSTOMER'],
    },
    {
      id: 'usr-owner-1',
      fullName: 'Vikramaditya Verma',
      email: 'owner@vahanloop.demo',
      phone: '+919123456789',
      passwordHash,
      accountStatus: 'ACTIVE',
      createdAt: new Date('2023-11-20T10:00:00Z'),
      updatedAt: new Date('2023-11-20T10:00:00Z'),
      roles: ['OWNER', 'CUSTOMER'],
    },
    {
      id: 'usr-admin-1',
      fullName: 'Priya Deshmukh',
      email: 'admin@vahanloop.demo',
      phone: '+919988776655',
      passwordHash,
      accountStatus: 'ACTIVE',
      createdAt: new Date('2023-08-01T10:00:00Z'),
      updatedAt: new Date('2023-08-01T10:00:00Z'),
      roles: ['ADMIN'],
    },
  ];

  const ownerProfiles = [
    {
      id: 'own-prof-1',
      userId: 'usr-owner-1',
      ownerType: 'INDIVIDUAL',
      businessName: null,
      verificationStatus: 'VERIFIED',
      createdAt: new Date('2023-11-20T10:00:00Z'),
    },
  ];

  const vehicles = [
    {
      id: 'veh-car-01',
      ownerId: 'usr-owner-1',
      category: 'CAR',
      make: 'Hyundai',
      model: 'i20 Asta (O)',
      registrationNumber: 'KA-01-MJ-5421',
      manufacturingYear: 2023,
      fuelType: 'PETROL',
      transmission: 'MANUAL',
      seatingCapacity: 5,
      description:
        'Immaculately maintained premium hatchback with electric sunroof, Bose 7-speaker audio, and digital cluster.',
      location: 'Indiranagar, Bengaluru',
      latitude: 12.9784,
      longitude: 77.6408,
      dailyRentalPrice: 1800,
      driverCharge: 700,
      selfDriveEnabled: true,
      chauffeurEnabled: true,
      approvalStatus: 'APPROVED',
      rejectionReason: null,
      availabilityStatus: 'AVAILABLE',
      createdAt: new Date('2024-01-10T10:00:00Z'),
      updatedAt: new Date('2024-01-10T10:00:00Z'),
      images: [
        {
          id: 'img-1',
          vehicleId: 'veh-car-01',
          imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80',
          imageType: 'COVER',
        },
      ],
      documents: [
        { id: 'doc-1', vehicleId: 'veh-car-01', documentType: 'RC', verificationStatus: 'VERIFIED' },
        { id: 'doc-2', vehicleId: 'veh-car-01', documentType: 'INSURANCE', verificationStatus: 'VERIFIED' },
      ],
    },
    {
      id: 'veh-car-02',
      ownerId: 'usr-owner-1',
      category: 'CAR',
      make: 'Maruti Suzuki',
      model: 'Baleno Alpha AMT',
      registrationNumber: 'KA-03-NL-9012',
      manufacturingYear: 2023,
      fuelType: 'PETROL',
      transmission: 'AUTOMATIC',
      seatingCapacity: 5,
      description: 'Effortless automatic driving with 360-degree camera and Heads-Up Display.',
      location: 'Koramangala, Bengaluru',
      latitude: 12.9352,
      longitude: 77.6245,
      dailyRentalPrice: 1650,
      driverCharge: 650,
      selfDriveEnabled: true,
      chauffeurEnabled: true,
      approvalStatus: 'APPROVED',
      rejectionReason: null,
      availabilityStatus: 'AVAILABLE',
      createdAt: new Date('2024-01-12T14:30:00Z'),
      updatedAt: new Date('2024-01-12T14:30:00Z'),
      images: [
        {
          id: 'img-2',
          vehicleId: 'veh-car-02',
          imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
          imageType: 'COVER',
        },
      ],
      documents: [
        { id: 'doc-3', vehicleId: 'veh-car-02', documentType: 'RC', verificationStatus: 'VERIFIED' },
      ],
    },
    {
      id: 'veh-car-03',
      ownerId: 'usr-owner-1',
      category: 'CAR',
      make: 'Tata',
      model: 'Nexon Fearless+ Diesel',
      registrationNumber: 'KA-05-PQ-7788',
      manufacturingYear: 2024,
      fuelType: 'DIESEL',
      transmission: 'MANUAL',
      seatingCapacity: 5,
      description: '5-Star Global NCAP safety compact SUV with ventilated seats and great ground clearance.',
      location: 'HSR Layout, Bengaluru',
      latitude: 12.9121,
      longitude: 77.6446,
      dailyRentalPrice: 2300,
      driverCharge: 800,
      selfDriveEnabled: true,
      chauffeurEnabled: true,
      approvalStatus: 'APPROVED',
      rejectionReason: null,
      availabilityStatus: 'AVAILABLE',
      createdAt: new Date('2024-01-18T09:15:00Z'),
      updatedAt: new Date('2024-01-18T09:15:00Z'),
      images: [
        {
          id: 'img-3',
          vehicleId: 'veh-car-03',
          imageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop&q=80',
          imageType: 'COVER',
        },
      ],
      documents: [
        { id: 'doc-4', vehicleId: 'veh-car-03', documentType: 'RC', verificationStatus: 'VERIFIED' },
      ],
    },
    {
      id: 'veh-car-04',
      ownerId: 'usr-owner-1',
      category: 'CAR',
      make: 'Honda',
      model: 'City ZX CVT',
      registrationNumber: 'KA-51-AB-1234',
      manufacturingYear: 2023,
      fuelType: 'PETROL',
      transmission: 'AUTOMATIC',
      seatingCapacity: 5,
      description: 'Executive luxury sedan with leather upholstery, LaneWatch camera, and Honda Sensing ADAS.',
      location: 'Whitefield, Bengaluru',
      latitude: 12.9698,
      longitude: 77.75,
      dailyRentalPrice: 2600,
      driverCharge: 850,
      selfDriveEnabled: true,
      chauffeurEnabled: true,
      approvalStatus: 'APPROVED',
      rejectionReason: null,
      availabilityStatus: 'AVAILABLE',
      createdAt: new Date('2024-01-22T11:45:00Z'),
      updatedAt: new Date('2024-01-22T11:45:00Z'),
      images: [
        {
          id: 'img-4',
          vehicleId: 'veh-car-04',
          imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop&q=80',
          imageType: 'COVER',
        },
      ],
      documents: [
        { id: 'doc-5', vehicleId: 'veh-car-04', documentType: 'RC', verificationStatus: 'VERIFIED' },
      ],
    },
    {
      id: 'veh-bike-01',
      ownerId: 'usr-owner-1',
      category: 'BIKE',
      make: 'Royal Enfield',
      model: 'Classic 350 Reborn',
      registrationNumber: 'KA-04-ER-9921',
      manufacturingYear: 2023,
      fuelType: 'PETROL',
      transmission: 'MANUAL',
      seatingCapacity: 2,
      description: 'Iconic cruiser equipped with smooth J-series engine and dual ISI-certified helmets included.',
      location: 'Indiranagar, Bengaluru',
      latitude: 12.9784,
      longitude: 77.6408,
      dailyRentalPrice: 950,
      driverCharge: null,
      selfDriveEnabled: true,
      chauffeurEnabled: false,
      approvalStatus: 'APPROVED',
      rejectionReason: null,
      availabilityStatus: 'AVAILABLE',
      createdAt: new Date('2024-01-25T16:00:00Z'),
      updatedAt: new Date('2024-01-25T16:00:00Z'),
      images: [
        {
          id: 'img-5',
          vehicleId: 'veh-bike-01',
          imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80',
          imageType: 'COVER',
        },
      ],
      documents: [
        { id: 'doc-6', vehicleId: 'veh-bike-01', documentType: 'RC', verificationStatus: 'VERIFIED' },
      ],
    },
    {
      id: 'veh-bike-02',
      ownerId: 'usr-owner-1',
      category: 'BIKE',
      make: 'Yamaha',
      model: 'FZ-S FI V4 Deluxe',
      registrationNumber: 'KA-02-JH-4433',
      manufacturingYear: 2024,
      fuelType: 'PETROL',
      transmission: 'MANUAL',
      seatingCapacity: 2,
      description: 'Sporty street commuter with traction control system and agile handling for city slicing.',
      location: 'Koramangala, Bengaluru',
      latitude: 12.9352,
      longitude: 77.6245,
      dailyRentalPrice: 750,
      driverCharge: null,
      selfDriveEnabled: true,
      chauffeurEnabled: false,
      approvalStatus: 'APPROVED',
      rejectionReason: null,
      availabilityStatus: 'AVAILABLE',
      createdAt: new Date('2024-01-28T12:00:00Z'),
      updatedAt: new Date('2024-01-28T12:00:00Z'),
      images: [
        {
          id: 'img-6',
          vehicleId: 'veh-bike-02',
          imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80',
          imageType: 'COVER',
        },
      ],
      documents: [
        { id: 'doc-7', vehicleId: 'veh-bike-02', documentType: 'RC', verificationStatus: 'VERIFIED' },
      ],
    },
    {
      id: 'veh-scooter-01',
      ownerId: 'usr-owner-1',
      category: 'SCOOTER',
      make: 'Honda',
      model: 'Activa 6G DLX',
      registrationNumber: 'KA-05-MM-1122',
      manufacturingYear: 2023,
      fuelType: 'PETROL',
      transmission: 'AUTOMATIC',
      seatingCapacity: 2,
      description: 'India’s most trusted automatic scooter with SmartKey immobilizer and silent ACG start.',
      location: 'HSR Layout, Bengaluru',
      latitude: 12.9121,
      longitude: 77.6446,
      dailyRentalPrice: 500,
      driverCharge: null,
      selfDriveEnabled: true,
      chauffeurEnabled: false,
      approvalStatus: 'APPROVED',
      rejectionReason: null,
      availabilityStatus: 'AVAILABLE',
      createdAt: new Date('2024-02-01T08:30:00Z'),
      updatedAt: new Date('2024-02-01T08:30:00Z'),
      images: [
        {
          id: 'img-7',
          vehicleId: 'veh-scooter-01',
          imageUrl: 'https://images.unsplash.com/photo-1571188654248-7a89213915f7?w=800&auto=format&fit=crop&q=80',
          imageType: 'COVER',
        },
      ],
      documents: [
        { id: 'doc-8', vehicleId: 'veh-scooter-01', documentType: 'RC', verificationStatus: 'VERIFIED' },
      ],
    },
    {
      id: 'veh-scooter-02',
      ownerId: 'usr-owner-1',
      category: 'SCOOTER',
      make: 'TVS',
      model: 'Jupiter 125 Disc',
      registrationNumber: 'KA-53-TT-8899',
      manufacturingYear: 2024,
      fuelType: 'PETROL',
      transmission: 'AUTOMATIC',
      seatingCapacity: 2,
      description: '125cc power with front fuel fill, giant 33-litre under-seat boot and Bluetooth dashboard.',
      location: 'Whitefield, Bengaluru',
      latitude: 12.9698,
      longitude: 77.75,
      dailyRentalPrice: 550,
      driverCharge: null,
      selfDriveEnabled: true,
      chauffeurEnabled: false,
      approvalStatus: 'APPROVED',
      rejectionReason: null,
      availabilityStatus: 'AVAILABLE',
      createdAt: new Date('2024-02-05T14:10:00Z'),
      updatedAt: new Date('2024-02-05T14:10:00Z'),
      images: [
        {
          id: 'img-8',
          vehicleId: 'veh-scooter-02',
          imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80',
          imageType: 'COVER',
        },
      ],
      documents: [
        { id: 'doc-9', vehicleId: 'veh-scooter-02', documentType: 'RC', verificationStatus: 'VERIFIED' },
      ],
    },
    {
      id: 'veh-car-pending-01',
      ownerId: 'usr-owner-1',
      category: 'CAR',
      make: 'Mahindra',
      model: 'XUV700 AX7 Luxury',
      registrationNumber: 'KA-01-XX-7000',
      manufacturingYear: 2024,
      fuelType: 'DIESEL',
      transmission: 'AUTOMATIC',
      seatingCapacity: 7,
      description: 'Flagship 7-seater SUV with panoramic Skyroof, Sony 3D sound, and ADAS Level 2.',
      location: 'Indiranagar, Bengaluru',
      latitude: 12.9784,
      longitude: 77.6408,
      dailyRentalPrice: 3500,
      driverCharge: 1000,
      selfDriveEnabled: true,
      chauffeurEnabled: true,
      approvalStatus: 'PENDING', // Awaiting admin review demonstration!
      rejectionReason: null,
      availabilityStatus: 'AVAILABLE',
      createdAt: new Date('2024-03-28T10:00:00Z'),
      updatedAt: new Date('2024-03-28T10:00:00Z'),
      images: [
        {
          id: 'img-9',
          vehicleId: 'veh-car-pending-01',
          imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80',
          imageType: 'COVER',
        },
      ],
      documents: [
        { id: 'doc-10', vehicleId: 'veh-car-pending-01', documentType: 'RC', verificationStatus: 'PENDING' },
      ],
    },
  ];

  const bookings = [
    {
      id: 'bk-demo-101',
      customerId: 'usr-customer-1',
      vehicleId: 'veh-car-01',
      rentalType: 'SELF_DRIVE',
      pickupDateTime: new Date('2024-04-10T09:00:00Z'),
      returnDateTime: new Date('2024-04-12T18:00:00Z'),
      pickupLocation: 'Indiranagar, Bengaluru',
      dropLocation: 'Indiranagar, Bengaluru',
      basePrice: 3600,
      driverCharge: 0,
      serviceFee: 360,
      securityDeposit: 2000,
      totalAmount: 5960,
      status: 'CONFIRMED',
      rejectionReason: null,
      createdAt: new Date('2024-04-01T12:00:00Z'),
      updatedAt: new Date('2024-04-01T14:32:00Z'),
    },
    {
      id: 'bk-demo-102',
      customerId: 'usr-customer-1',
      vehicleId: 'veh-bike-01',
      rentalType: 'SELF_DRIVE',
      pickupDateTime: new Date('2024-04-20T08:00:00Z'),
      returnDateTime: new Date('2024-04-21T20:00:00Z'),
      pickupLocation: 'Indiranagar, Bengaluru',
      dropLocation: 'Indiranagar, Bengaluru',
      basePrice: 950,
      driverCharge: 0,
      serviceFee: 95,
      securityDeposit: 1500,
      totalAmount: 2545,
      status: 'AWAITING_PAYMENT',
      rejectionReason: null,
      createdAt: new Date('2024-04-02T09:15:00Z'),
      updatedAt: new Date('2024-04-02T10:00:00Z'),
    },
    {
      id: 'bk-demo-103',
      customerId: 'usr-customer-1',
      vehicleId: 'veh-car-02',
      rentalType: 'CHAUFFEUR',
      pickupDateTime: new Date('2024-04-25T10:00:00Z'),
      returnDateTime: new Date('2024-04-27T18:00:00Z'),
      pickupLocation: 'Koramangala, Bengaluru',
      dropLocation: 'Koramangala, Bengaluru',
      basePrice: 3300,
      driverCharge: 1300,
      serviceFee: 460,
      securityDeposit: 2000,
      totalAmount: 7060,
      status: 'REQUESTED',
      rejectionReason: null,
      createdAt: new Date('2024-04-03T11:20:00Z'),
      updatedAt: new Date('2024-04-03T11:20:00Z'),
    },
  ];

  const payments = [
    {
      id: 'pay-1',
      bookingId: 'bk-demo-101',
      amount: 5960,
      paymentMethod: 'UPI',
      paymentStatus: 'COMPLETED',
      transactionReference: 'TXN-VL-89421-DEMO',
      createdAt: new Date('2024-04-01T14:32:00Z'),
    },
  ];

  const statusHistories = [
    {
      id: 'hist-1',
      bookingId: 'bk-demo-101',
      previousStatus: 'AWAITING_PAYMENT',
      newStatus: 'CONFIRMED',
      changedBy: 'usr-customer-1',
      note: 'Simulated payment completed',
      createdAt: new Date('2024-04-01T14:32:00Z'),
    },
  ];

  const auditLogs = [
    {
      id: 'aud-1',
      actorId: 'usr-admin-1',
      action: 'SYSTEM_INITIALIZATION',
      entityType: 'PLATFORM',
      entityId: 'ROOT',
      details: 'Platform initialized with Phase 5 relational schema',
      createdAt: new Date(),
    },
  ];

  const organisations = [
    {
      id: 'org-fleet-01',
      businessName: 'Apex Mobility Fleet Services LLP',
      businessType: 'LLP',
      registeredAddress: '12th Floor, World Trade Centre, Malleshwaram, Bengaluru, Karnataka 560055',
      panNumber: 'AABCA1234F',
      gstin: '29AABCA1234F1Z5',
      contactPerson: 'Vikramaditya Verma',
      contactEmail: 'fleet@apexmobility.in',
      contactPhone: '+919123456789',
      verificationStatus: 'VERIFIED',
      rejectionReason: null,
      createdAt: new Date('2024-01-01T10:00:00Z'),
      updatedAt: new Date('2024-01-01T10:00:00Z'),
    },
  ];

  const fleetMembers = [
    {
      id: 'fm-01',
      orgId: 'org-fleet-01',
      userId: 'usr-owner-1',
      role: 'OWNER',
      permissions: 'MANAGE_ALL,ASSIGN_DRIVERS,VIEW_FINANCIALS',
      createdAt: new Date('2024-01-01T10:00:00Z'),
    },
  ];

  const fleetLocations = [
    {
      id: 'loc-blr-01',
      orgId: 'org-fleet-01',
      name: 'Indiranagar Central Hub',
      address: '100ft Road, HAL 2nd Stage, Indiranagar',
      city: 'Bengaluru',
      postalCode: '560038',
      latitude: 12.9784,
      longitude: 77.6408,
      contactPerson: 'Karan Singh',
      contactNumber: '+919845011223',
      operatingHours: '06:00 - 23:00',
      pickupInstructions: 'Report to Bay 3. Key handover counter at customer lounge.',
      isActive: true,
      createdAt: new Date('2024-01-05T10:00:00Z'),
    },
    {
      id: 'loc-blr-02',
      orgId: 'org-fleet-01',
      name: 'Kempegowda Airport Depot (BLR)',
      address: 'Terminal 1 Dedicated Hub, Devanahalli',
      city: 'Bengaluru',
      postalCode: '560300',
      latitude: 13.1986,
      longitude: 77.7066,
      contactPerson: 'Arun Nair',
      contactNumber: '+919845099887',
      operatingHours: '24 Hours',
      pickupInstructions: 'Pick-up from Zone B Pillar 14 after baggage carousel.',
      isActive: true,
      createdAt: new Date('2024-01-10T10:00:00Z'),
    },
  ];

  const fleetAssignments = [
    {
      id: 'fa-01',
      vehicleId: 'veh-car-01',
      orgId: 'org-fleet-01',
      locationId: 'loc-blr-01',
      assignedAt: new Date('2024-01-15T10:00:00Z'),
    },
    {
      id: 'fa-02',
      vehicleId: 'veh-car-02',
      orgId: 'org-fleet-01',
      locationId: 'loc-blr-01',
      assignedAt: new Date('2024-01-15T10:00:00Z'),
    },
    {
      id: 'fa-03',
      vehicleId: 'veh-car-04',
      orgId: 'org-fleet-01',
      locationId: 'loc-blr-02',
      assignedAt: new Date('2024-01-20T10:00:00Z'),
    },
  ];

  const ownerVerifications = [
    {
      id: 'ov-01',
      userId: 'usr-owner-1',
      ownerType: 'INDIVIDUAL',
      currentStep: 5,
      status: 'VERIFIED',
      fullName: 'Vikramaditya Verma',
      email: 'owner@vahanloop.demo',
      mobile: '+919123456789',
      address: 'Flat 402, Prestige Palms, Indiranagar, Bengaluru 560038',
      profilePhotoUrl: null,
      idVerificationMethod: 'MANUAL_VOTER_ID',
      idVerificationRef: 'SYN-DL-KA0320198811',
      bankAccountHolder: 'Vikramaditya Verma',
      bankVerificationStatus: 'VERIFIED',
      bankVerificationRef: 'SYN-HDFC-991204',
      payoutEligible: true,
      termsAccepted: true,
      termsVersion: 'v1.2',
      termsAcceptedAt: new Date('2023-11-20T10:00:00Z'),
      submittedAt: new Date('2023-11-20T10:00:00Z'),
      reviewedBy: 'usr-admin-1',
      reviewedAt: new Date('2023-11-21T11:00:00Z'),
      rejectionReason: null,
      createdAt: new Date('2023-11-20T10:00:00Z'),
      updatedAt: new Date('2023-11-21T11:00:00Z'),
    },
  ];

  const driverProfiles = [
    {
      id: 'drv-01',
      userId: 'usr-driver-1',
      fullName: 'Ramesh Kumar',
      phone: '+919876501234',
      email: 'ramesh.driver@vahanloop.demo',
      address: 'Domlur Layout, Bengaluru, Karnataka',
      licenceCategory: 'LMV-TR',
      licenceNumber: 'KA-01-20150009988',
      licenceVerificationStatus: 'VERIFIED',
      backgroundScreeningStatus: 'VERIFIED',
      employmentType: 'CONTRACTOR',
      orgId: 'org-fleet-01',
      availabilityStatus: 'AVAILABLE',
      rating: 4.9,
      totalTrips: 142,
      rejectionReason: null,
      createdAt: new Date('2024-01-01T10:00:00Z'),
      updatedAt: new Date('2024-01-01T10:00:00Z'),
    },
    {
      id: 'drv-02',
      userId: 'usr-driver-2',
      fullName: 'Manjunath Gowda',
      phone: '+919876505678',
      email: 'manjunath.driver@vahanloop.demo',
      address: 'Koramangala, Bengaluru, Karnataka',
      licenceCategory: 'LMV',
      licenceNumber: 'KA-05-20180011223',
      licenceVerificationStatus: 'VERIFIED',
      backgroundScreeningStatus: 'VERIFIED',
      employmentType: 'FULL_TIME',
      orgId: 'org-fleet-01',
      availabilityStatus: 'AVAILABLE',
      rating: 4.8,
      totalTrips: 87,
      rejectionReason: null,
      createdAt: new Date('2024-01-15T10:00:00Z'),
      updatedAt: new Date('2024-01-15T10:00:00Z'),
    },
  ];

  const driverAssignments = [
    {
      id: 'dta-01',
      bookingId: 'bk-demo-103',
      driverId: 'drv-01',
      status: 'ASSIGNED',
      tripStartTime: null,
      tripEndTime: null,
      startOdometer: null,
      endOdometer: null,
      notes: 'Customer requested luggage assistance at pickup',
      rejectionReason: null,
      createdAt: new Date('2024-04-03T11:30:00Z'),
      updatedAt: new Date('2024-04-03T11:30:00Z'),
    },
  ];

  const complianceRules = [
    {
      id: 'cr-ka-car-sd',
      ruleId: 'RULE-KA-CAR-SELFDRIVE',
      jurisdictionState: 'KARNATAKA',
      jurisdictionCity: 'BENGALURU',
      vehicleCategory: 'CAR',
      rentalModel: 'SELF_DRIVE',
      ownerCategory: 'INDIVIDUAL',
      requiredDocuments: 'RC,INSURANCE,PUC',
      requiredPermits: 'RENT_A_CAB',
      status: 'ACTIVE',
      effectiveDate: new Date('2024-01-01T00:00:00Z'),
      expiryDate: null,
      sourceReference: 'Motor Vehicles Act 1988, Section 75 / Rent a Cab Scheme 1989',
      reviewerNotes: 'Mandatory commercial Yellow-on-Black registration or verified platform pilot permit.',
      version: 1,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
    },
    {
      id: 'cr-ka-car-ch',
      ruleId: 'RULE-KA-CAR-CHAUFFEUR',
      jurisdictionState: 'KARNATAKA',
      jurisdictionCity: 'BENGALURU',
      vehicleCategory: 'CAR',
      rentalModel: 'CHAUFFEUR',
      ownerCategory: 'BUSINESS',
      requiredDocuments: 'RC,INSURANCE,PUC,COMMERCIAL_PERMIT',
      requiredPermits: 'ALL_INDIA_TOURIST_PERMIT',
      status: 'ACTIVE',
      effectiveDate: new Date('2024-01-01T00:00:00Z'),
      expiryDate: null,
      sourceReference: 'Karnataka Motor Vehicles Rules 1989, Rule 115',
      reviewerNotes: 'Requires LMV-TR driver badge and valid commercial insurance endorsement.',
      version: 1,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
    },
    {
      id: 'cr-ka-bike-sd',
      ruleId: 'RULE-KA-BIKE-SELFDRIVE',
      jurisdictionState: 'KARNATAKA',
      jurisdictionCity: 'BENGALURU',
      vehicleCategory: 'BIKE',
      rentalModel: 'SELF_DRIVE',
      ownerCategory: 'INDIVIDUAL',
      requiredDocuments: 'RC,INSURANCE,PUC',
      requiredPermits: 'RENT_A_MOTORCYCLE',
      status: 'ACTIVE',
      effectiveDate: new Date('2024-01-01T00:00:00Z'),
      expiryDate: null,
      sourceReference: 'Rent a Motorcycle Scheme 1997',
      reviewerNotes: 'Valid fitness certificate and two ISI-certified helmets mandatory.',
      version: 1,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
    },
    {
      id: 'cr-mh-car-sd',
      ruleId: 'RULE-MH-CAR-SELFDRIVE',
      jurisdictionState: 'MAHARASHTRA',
      jurisdictionCity: 'MUMBAI',
      vehicleCategory: 'CAR',
      rentalModel: 'SELF_DRIVE',
      ownerCategory: 'BUSINESS',
      requiredDocuments: 'RC,INSURANCE,PUC,COMMERCIAL_PERMIT',
      requiredPermits: 'RENT_A_CAB',
      status: 'ACTIVE',
      effectiveDate: new Date('2024-01-01T00:00:00Z'),
      expiryDate: null,
      sourceReference: 'Maharashtra Motor Vehicles Department Notification 2021',
      reviewerNotes: 'Speed governor verification and GPS telematics logging required.',
      version: 1,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
    },
  ];

  const complianceVersions = [
    {
      id: 'crv-01',
      ruleId: 'cr-ka-car-sd',
      version: 1,
      changeSummary: 'Initial policy baseline for Karnataka self-drive pilot',
      changedBy: 'usr-admin-1',
      snapshot: JSON.stringify(complianceRules[0]),
      createdAt: new Date('2024-01-01T00:00:00Z'),
    },
  ];

  const expiryNotifications = [
    {
      id: 'notif-exp-01',
      entityType: 'VEHICLE',
      entityId: 'veh-car-01',
      documentType: 'PUC',
      expiryDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days left
      daysRemaining: 12,
      threshold: 15,
      notifiedAt: new Date(),
      status: 'SENT',
    },
    {
      id: 'notif-exp-02',
      entityType: 'DRIVER',
      entityId: 'drv-02',
      documentType: 'DRIVING_LICENCE',
      expiryDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days left
      daysRemaining: 6,
      threshold: 7,
      notifiedAt: new Date(),
      status: 'SENT',
    },
  ];

  const handovers = [
    {
      id: 'ho-01',
      bookingId: 'bk-demo-101',
      completedAt: new Date('2024-04-10T09:15:00Z'),
      verifiedBy: 'usr-owner-1',
      odometerReading: 24500,
      fuelLevelPercent: 100,
      conditionRating: 'EXCELLENT',
      notes: 'Clean handover. All 4 panels photographed. Spare tyre and tools verified.',
      photosJson: JSON.stringify([
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800',
      ]),
      customerConfirmed: true,
      handoverStatus: 'COMPLETED',
    },
  ];

  const returnRecords = [
    {
      id: 'ret-01',
      bookingId: 'bk-demo-101',
      completedAt: new Date('2024-04-12T18:05:00Z'),
      verifiedBy: 'usr-owner-1',
      odometerReading: 24890,
      fuelLevelPercent: 100,
      conditionRating: 'EXCELLENT',
      notes: 'Returned in pristine condition. Zero new scratches or dents.',
      photosJson: JSON.stringify([
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800',
      ]),
      disputeRaised: false,
      disputeNotes: null,
      returnStatus: 'COMPLETED',
    },
  ];

  const incidents = [
    {
      id: 'inc-01',
      bookingId: 'bk-demo-101',
      reportedBy: 'usr-customer-1',
      reportedByRole: 'CUSTOMER',
      vehicleId: 'veh-car-01',
      driverId: null,
      category: 'BREAKDOWN',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      title: 'Flat tyre on Outer Ring Road',
      description: 'Rear left tyre suffered puncture near Marathahalli. Spare tyre fitted via roadside assistance.',
      location: 'Outer Ring Road, Marathahalli, Bengaluru',
      emergencyContactUsed: false,
      assignedAgentId: 'usr-admin-1',
      resolutionNotes: 'Roadside puncture technician dispatched within 25 minutes. Replacement tyre fitted smoothly.',
      createdAt: new Date('2024-04-11T14:20:00Z'),
      updatedAt: new Date('2024-04-11T15:10:00Z'),
    },
    {
      id: 'inc-02',
      bookingId: 'bk-demo-103',
      reportedBy: 'usr-customer-1',
      reportedByRole: 'CUSTOMER',
      vehicleId: 'veh-car-02',
      driverId: 'drv-01',
      category: 'LATE_RETURN',
      priority: 'LOW',
      status: 'OPEN',
      title: 'Traffic delay on return leg',
      description: 'Heavy traffic on Silk Board junction may cause a 30-minute late handover. Notified host in advance.',
      location: 'Hosur Road, Bengaluru',
      emergencyContactUsed: false,
      assignedAgentId: null,
      resolutionNotes: null,
      createdAt: new Date('2024-04-27T17:30:00Z'),
      updatedAt: new Date('2024-04-27T17:30:00Z'),
    },
  ];

  const supportTickets = [
    {
      id: 'tkt-01',
      ticketNumber: 'VL-TKT-10029',
      raisedBy: 'usr-customer-1',
      raisedByRole: 'CUSTOMER',
      category: 'BOOKING',
      subject: 'Query regarding airport pickup zone',
      description: 'Can the host deliver the vehicle to Terminal 2 rather than Terminal 1 at BLR airport?',
      priority: 'LOW',
      status: 'IN_PROGRESS',
      bookingId: 'bk-demo-101',
      assignedTo: 'usr-admin-1',
      resolutionNotes: null,
      createdAt: new Date('2024-04-05T10:00:00Z'),
      updatedAt: new Date('2024-04-05T11:00:00Z'),
    },
  ];

  const supportMessages = [
    {
      id: 'msg-01',
      ticketId: 'tkt-01',
      senderId: 'usr-customer-1',
      senderName: 'Rahul Sharma',
      senderRole: 'CUSTOMER',
      message: 'Hello support team, I would like to request vehicle drop at Terminal 2 instead of Terminal 1.',
      attachments: null,
      createdAt: new Date('2024-04-05T10:00:00Z'),
    },
    {
      id: 'msg-02',
      ticketId: 'tkt-01',
      senderId: 'usr-admin-1',
      senderName: 'Priya Deshmukh (Support)',
      senderRole: 'ADMIN',
      message: 'Hi Rahul, we have coordinated with Apex Mobility. Terminal 2 handover is confirmed at no extra charge.',
      attachments: null,
      createdAt: new Date('2024-04-05T11:00:00Z'),
    },
  ];

  const adminReviews = [
    {
      id: 'rev-01',
      entityType: 'OWNER',
      entityId: 'ov-01',
      adminId: 'usr-admin-1',
      action: 'APPROVE',
      previousStatus: 'UNDER_REVIEW',
      newStatus: 'VERIFIED',
      reason: 'Verified voter ID and bank account IFSC documentation. Payout enabled.',
      createdAt: new Date('2023-11-21T11:00:00Z'),
    },
  ];

  return {
    users,
    ownerProfiles,
    vehicles,
    bookings,
    payments,
    statusHistories,
    auditLogs,
    organisations,
    fleetMembers,
    fleetLocations,
    fleetAssignments,
    ownerVerifications,
    driverProfiles,
    driverAssignments,
    complianceRules,
    complianceVersions,
    expiryNotifications,
    handovers,
    returns: returnRecords,
    incidents,
    supportTickets,
    supportMessages,
    adminReviews,
  };
}

if (!globalForPrisma.dbStore) {
  globalForPrisma.dbStore = getInitialSeedData();
}

// Unified Database API with auto-fallback to persistent store
export const db: any = {
  get store() {
    return globalForPrisma.dbStore;
  },

  resetStore() {
    globalForPrisma.dbStore = getInitialSeedData();
    return true;
  },

  // Users
  user: {
    async findUnique({ where }: { where: { id?: string; email?: string; phone?: string } }) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) {
        return (prisma.user.findUnique as any)({
          where,
          include: { roles: true, ownerProfile: true, driverProfile: true },
        });
      }
      const u = globalForPrisma.dbStore.users.find((user: any) => {
        if (where.id && user.id === where.id) return true;
        if (where.email && user.email.toLowerCase() === where.email.toLowerCase()) return true;
        if (where.phone && user.phone === where.phone) return true;
        return false;
      });
      if (!u) return null;
      const ownerProf = globalForPrisma.dbStore.ownerProfiles.find((o: any) => o.userId === u.id);
      return {
        ...u,
        roles: u.roles.map((r: string) => ({ role: r })),
        ownerProfile: ownerProf || null,
      };
    },

    async findFirst({ where }: any) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma.user.findFirst as any)({ where });
      return (await db.user.findMany({ where, take: 1 }))[0] || null;
    },

    async findMany({ where, orderBy }: any = {}) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) {
        return (prisma.user.findMany as any)({
          where,
          orderBy,
          include: { roles: true, ownerProfile: true },
        });
      }
      let list = [...globalForPrisma.dbStore.users];
      if (where?.roles?.some) {
        const requiredRole = where.roles.some.role;
        list = list.filter((u) => u.roles.includes(requiredRole));
      }
      return list.map((u) => ({
        ...u,
        roles: u.roles.map((r: string) => ({ role: r })),
        ownerProfile: globalForPrisma.dbStore.ownerProfiles.find((o: any) => o.userId === u.id) || null,
      }));
    },

    async create({ data }: any) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) {
        return (prisma.user.create as any)({ data, include: { roles: true, ownerProfile: true } });
      }
      const id = data.id || `usr-${Date.now().toString().slice(-6)}`;
      const roles = data.roles?.create?.map((r: any) => r.role) || ['CUSTOMER'];
      const newUser = {
        id,
        fullName: data.fullName,
        email: data.email.toLowerCase(),
        phone: data.phone,
        passwordHash: data.passwordHash,
        accountStatus: data.accountStatus || 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        roles,
      };
      globalForPrisma.dbStore.users.push(newUser);

      if (data.ownerProfile?.create) {
        const op = {
          id: `own-${Date.now().toString().slice(-6)}`,
          userId: id,
          ownerType: data.ownerProfile.create.ownerType || 'INDIVIDUAL',
          businessName: data.ownerProfile.create.businessName || null,
          verificationStatus: 'VERIFIED',
          createdAt: new Date(),
        };
        globalForPrisma.dbStore.ownerProfiles.push(op);
      }

      return db.user.findUnique({ where: { id } });
    },

    async update({ where, data }: any) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma.user.update as any)({ where, data });
      const idx = globalForPrisma.dbStore.users.findIndex((u: any) => u.id === where.id);
      if (idx >= 0) {
        globalForPrisma.dbStore.users[idx] = {
          ...globalForPrisma.dbStore.users[idx],
          ...data,
          updatedAt: new Date(),
        };
        return db.user.findUnique({ where });
      }
      return null;
    },
  },

  // Vehicles
  vehicle: {
    async findUnique({ where }: any) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) {
        return (prisma.vehicle.findUnique as any)({
          where,
          include: { owner: true, images: true, documents: true, reviews: true },
        });
      }
      const v = globalForPrisma.dbStore.vehicles.find((veh: any) => veh.id === where.id);
      if (!v) return null;
      const owner = globalForPrisma.dbStore.users.find((u: any) => u.id === v.ownerId);
      return {
        ...v,
        owner,
        images: v.images || [],
        documents: v.documents || [],
        reviews: [],
      };
    },

    async findMany({ where, orderBy }: any = {}) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) {
        return (prisma.vehicle.findMany as any)({
          where,
          orderBy,
          include: { owner: true, images: true, documents: true, reviews: true },
        });
      }
      let list = [...globalForPrisma.dbStore.vehicles];
      if (where) {
        if (where.ownerId) list = list.filter((v) => v.ownerId === where.ownerId);
        if (where.approvalStatus) list = list.filter((v) => v.approvalStatus === where.approvalStatus);
        if (where.availabilityStatus) list = list.filter((v) => v.availabilityStatus === where.availabilityStatus);
        if (where.category) list = list.filter((v) => v.category === where.category);
        if (where.location) list = list.filter((v) => v.location.toLowerCase().includes(where.location.toLowerCase()));
        if (where.selfDriveEnabled !== undefined) list = list.filter((v) => v.selfDriveEnabled === where.selfDriveEnabled);
        if (where.chauffeurEnabled !== undefined) list = list.filter((v) => v.chauffeurEnabled === where.chauffeurEnabled);
        if (where.dailyRentalPrice?.lte) list = list.filter((v) => v.dailyRentalPrice <= where.dailyRentalPrice.lte);
      }
      return list.map((v) => ({
        ...v,
        owner: globalForPrisma.dbStore.users.find((u: any) => u.id === v.ownerId),
        images: v.images || [],
        documents: v.documents || [],
        reviews: [],
      }));
    },

    async create({ data }: any) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma.vehicle.create as any)({ data });
      const id = data.id || `veh-${Date.now().toString().slice(-6)}`;
      const newVeh = {
        ...data,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
        images: data.images?.create ? data.images.create.map((img: any) => ({ ...img, id: `img-${Date.now()}` })) : [],
        documents: data.documents?.create ? data.documents.create.map((doc: any) => ({ ...doc, id: `doc-${Date.now()}` })) : [],
      };
      globalForPrisma.dbStore.vehicles.unshift(newVeh);
      return db.vehicle.findUnique({ where: { id } });
    },

    async update({ where, data }: any) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma.vehicle.update as any)({ where, data });
      const idx = globalForPrisma.dbStore.vehicles.findIndex((v: any) => v.id === where.id);
      if (idx >= 0) {
        globalForPrisma.dbStore.vehicles[idx] = {
          ...globalForPrisma.dbStore.vehicles[idx],
          ...data,
          updatedAt: new Date(),
        };
        return db.vehicle.findUnique({ where });
      }
      return null;
    },

    async delete({ where }: any) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma.vehicle.delete as any)({ where });
      const idx = globalForPrisma.dbStore.vehicles.findIndex((v: any) => v.id === where.id);
      if (idx >= 0) {
        const deleted = globalForPrisma.dbStore.vehicles.splice(idx, 1)[0];
        return deleted;
      }
      return null;
    },
  },

  // Bookings
  booking: {
    async findUnique({ where }: any) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) {
        return (prisma.booking.findUnique as any)({
          where,
          include: { customer: true, vehicle: { include: { owner: true } }, payments: true, statusHistory: true },
        });
      }
      const b = globalForPrisma.dbStore.bookings.find((bk: any) => bk.id === where.id);
      if (!b) return null;
      const customer = globalForPrisma.dbStore.users.find((u: any) => u.id === b.customerId);
      const vehicle = await db.vehicle.findUnique({ where: { id: b.vehicleId } });
      const payments = globalForPrisma.dbStore.payments.filter((p: any) => p.bookingId === b.id);
      const statusHistory = globalForPrisma.dbStore.statusHistories.filter((h: any) => h.bookingId === b.id);
      return { ...b, customer, vehicle, payments, statusHistory };
    },

    async findMany({ where, orderBy }: any = {}) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) {
        return (prisma.booking.findMany as any)({
          where,
          orderBy,
          include: { customer: true, vehicle: { include: { owner: true } }, payments: true },
        });
      }
      let list = [...globalForPrisma.dbStore.bookings];
      if (where) {
        if (where.customerId) list = list.filter((b) => b.customerId === where.customerId);
        if (where.vehicleId) list = list.filter((b) => b.vehicleId === where.vehicleId);
        if (where.status) list = list.filter((b) => b.status === where.status);
        if (where.vehicle?.ownerId) {
          const ownerVehIds = globalForPrisma.dbStore.vehicles
            .filter((v: any) => v.ownerId === where.vehicle.ownerId)
            .map((v: any) => v.id);
          list = list.filter((b) => ownerVehIds.includes(b.vehicleId));
        }
      }
      const enriched = await Promise.all(
        list.map(async (b) => {
          const customer = globalForPrisma.dbStore.users.find((u: any) => u.id === b.customerId);
          const vehicle = await db.vehicle.findUnique({ where: { id: b.vehicleId } });
          const payments = globalForPrisma.dbStore.payments.filter((p: any) => p.bookingId === b.id);
          return { ...b, customer, vehicle, payments };
        })
      );
      return enriched;
    },

    async create({ data }: any) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma.booking.create as any)({ data });
      const id = data.id || `bk-${Date.now().toString().slice(-6)}`;
      const newBk = {
        ...data,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      globalForPrisma.dbStore.bookings.unshift(newBk);

      // Create initial history record
      globalForPrisma.dbStore.statusHistories.push({
        id: `hist-${Date.now()}`,
        bookingId: id,
        previousStatus: null,
        newStatus: data.status || 'REQUESTED',
        changedBy: data.customerId,
        note: 'Booking requested by customer',
        createdAt: new Date(),
      });

      return db.booking.findUnique({ where: { id } });
    },

    async update({ where, data }: any) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma.booking.update as any)({ where, data });
      const idx = globalForPrisma.dbStore.bookings.findIndex((b: any) => b.id === where.id);
      if (idx >= 0) {
        const prev = globalForPrisma.dbStore.bookings[idx];
        globalForPrisma.dbStore.bookings[idx] = {
          ...prev,
          ...data,
          updatedAt: new Date(),
        };

        if (data.status && data.status !== prev.status) {
          globalForPrisma.dbStore.statusHistories.push({
            id: `hist-${Date.now()}`,
            bookingId: prev.id,
            previousStatus: prev.status,
            newStatus: data.status,
            changedBy: data._changedBy || 'SYSTEM',
            note: data.rejectionReason || null,
            createdAt: new Date(),
          });
        }
        return db.booking.findUnique({ where });
      }
      return null;
    },
  },

  // Payments
  payment: {
    async create({ data }: any) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma.payment.create as any)({ data });
      const id = `pay-${Date.now()}`;
      const newPay = { ...data, id, createdAt: new Date() };
      globalForPrisma.dbStore.payments.push(newPay);
      return newPay;
    },
    async findMany({ where }: any = {}) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma.payment.findMany as any)({ where });
      let list = [...globalForPrisma.dbStore.payments];
      if (where?.bookingId) list = list.filter((p) => p.bookingId === where.bookingId);
      return list;
    },
  },

  // Audit Logs
  auditLog: {
    async create({ data }: any) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma.auditLog.create as any)({ data });
      const log = { id: `aud-${Date.now()}`, ...data, createdAt: new Date() };
      globalForPrisma.dbStore.auditLogs.unshift(log);
      return log;
    },
    async findMany({ where }: any = {}) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma.auditLog.findMany as any)({ where, orderBy: { createdAt: 'desc' } });
      return [...globalForPrisma.dbStore.auditLogs];
    },
  },

  // Business Organisations & Fleet
  businessOrganisation: {
    async findUnique({ where }: any) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma as any).businessOrganisation.findUnique({ where, include: { members: true, locations: true, assignments: true } });
      return globalForPrisma.dbStore.organisations.find((o: any) => o.id === where.id) || null;
    },
    async findMany({ where }: any = {}) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma as any).businessOrganisation.findMany({ where });
      return [...globalForPrisma.dbStore.organisations];
    },
    async create({ data }: any) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma as any).businessOrganisation.create({ data });
      const id = data.id || `org-${Date.now().toString().slice(-6)}`;
      const org = { ...data, id, createdAt: new Date(), updatedAt: new Date() };
      globalForPrisma.dbStore.organisations.push(org);
      return org;
    },
    async update({ where, data }: any) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma as any).businessOrganisation.update({ where, data });
      const idx = globalForPrisma.dbStore.organisations.findIndex((o: any) => o.id === where.id);
      if (idx >= 0) {
        globalForPrisma.dbStore.organisations[idx] = { ...globalForPrisma.dbStore.organisations[idx], ...data, updatedAt: new Date() };
        return globalForPrisma.dbStore.organisations[idx];
      }
      return null;
    },
  },

  fleetMember: {
    async findMany({ where }: any = {}) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma as any).fleetMember.findMany({ where });
      let list = [...globalForPrisma.dbStore.fleetMembers];
      if (where?.orgId) list = list.filter((m) => m.orgId === where.orgId);
      if (where?.userId) list = list.filter((m) => m.userId === where.userId);
      return list;
    },
    async create({ data }: any) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma as any).fleetMember.create({ data });
      const id = data.id || `fm-${Date.now()}`;
      const mem = { ...data, id, createdAt: new Date() };
      globalForPrisma.dbStore.fleetMembers.push(mem);
      return mem;
    },
  },

  fleetLocation: {
    async findMany({ where }: any = {}) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma as any).fleetLocation.findMany({ where });
      let list = [...globalForPrisma.dbStore.fleetLocations];
      if (where?.orgId) list = list.filter((l) => l.orgId === where.orgId);
      if (where?.city) list = list.filter((l) => l.city.toLowerCase() === where.city.toLowerCase());
      return list;
    },
    async create({ data }: any) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma as any).fleetLocation.create({ data });
      const id = data.id || `loc-${Date.now().toString().slice(-6)}`;
      const loc = { ...data, id, createdAt: new Date() };
      globalForPrisma.dbStore.fleetLocations.push(loc);
      return loc;
    },
  },

  fleetVehicleAssignment: {
    async findMany({ where }: any = {}) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma as any).fleetVehicleAssignment.findMany({ where, include: { location: true } });
      let list = [...globalForPrisma.dbStore.fleetAssignments];
      if (where?.orgId) list = list.filter((a) => a.orgId === where.orgId);
      if (where?.vehicleId) list = list.filter((a) => a.vehicleId === where.vehicleId);
      return list.map((a) => ({
        ...a,
        location: globalForPrisma.dbStore.fleetLocations.find((l: any) => l.id === a.locationId) || null,
      }));
    },
    async create({ data }: any) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma as any).fleetVehicleAssignment.create({ data });
      const id = data.id || `fa-${Date.now()}`;
      const assign = { ...data, id, assignedAt: new Date() };
      globalForPrisma.dbStore.fleetAssignments.push(assign);
      return assign;
    },
  },

  // Owner Verification Application
  ownerVerificationApplication: {
    async findUnique({ where }: any) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma as any).ownerVerificationApplication.findUnique({ where });
      return globalForPrisma.dbStore.ownerVerifications.find((v: any) => (where.id && v.id === where.id) || (where.userId && v.userId === where.userId)) || null;
    },
    async findMany({ where }: any = {}) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma as any).ownerVerificationApplication.findMany({ where });
      let list = [...globalForPrisma.dbStore.ownerVerifications];
      if (where?.status) list = list.filter((v) => v.status === where.status);
      return list;
    },
    async create({ data }: any) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma as any).ownerVerificationApplication.create({ data });
      const id = data.id || `ov-${Date.now().toString().slice(-6)}`;
      const app = { ...data, id, createdAt: new Date(), updatedAt: new Date() };
      globalForPrisma.dbStore.ownerVerifications.push(app);
      return app;
    },
    async update({ where, data }: any) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma as any).ownerVerificationApplication.update({ where, data });
      const idx = globalForPrisma.dbStore.ownerVerifications.findIndex((v: any) => (where.id && v.id === where.id) || (where.userId && v.userId === where.userId));
      if (idx >= 0) {
        globalForPrisma.dbStore.ownerVerifications[idx] = { ...globalForPrisma.dbStore.ownerVerifications[idx], ...data, updatedAt: new Date() };
        return globalForPrisma.dbStore.ownerVerifications[idx];
      }
      return null;
    },
  },

  // Administrative Reviews
  administrativeReview: {
    async create({ data }: any) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma as any).administrativeReview.create({ data });
      const id = data.id || `rev-${Date.now()}`;
      const rev = { ...data, id, createdAt: new Date() };
      globalForPrisma.dbStore.adminReviews.unshift(rev);
      return rev;
    },
    async findMany({ where }: any = {}) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma as any).administrativeReview.findMany({ where, orderBy: { createdAt: 'desc' } });
      let list = [...globalForPrisma.dbStore.adminReviews];
      if (where?.entityType) list = list.filter((r) => r.entityType === where.entityType);
      if (where?.entityId) list = list.filter((r) => r.entityId === where.entityId);
      return list;
    },
  },

  // Driver Profiles & Assignments
  extendedDriverProfile: {
    async findUnique({ where }: any) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma as any).extendedDriverProfile.findUnique({ where, include: { assignments: true } });
      return globalForPrisma.dbStore.driverProfiles.find((d: any) => (where.id && d.id === where.id) || (where.userId && d.userId === where.userId)) || null;
    },
    async findMany({ where }: any = {}) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma as any).extendedDriverProfile.findMany({ where, include: { assignments: true } });
      let list = [...globalForPrisma.dbStore.driverProfiles];
      if (where?.availabilityStatus) list = list.filter((d) => d.availabilityStatus === where.availabilityStatus);
      if (where?.orgId) list = list.filter((d) => d.orgId === where.orgId);
      return list;
    },
    async create({ data }: any) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma as any).extendedDriverProfile.create({ data });
      const id = data.id || `drv-${Date.now().toString().slice(-6)}`;
      const drv = { ...data, id, createdAt: new Date(), updatedAt: new Date() };
      globalForPrisma.dbStore.driverProfiles.push(drv);
      return drv;
    },
    async update({ where, data }: any) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma as any).extendedDriverProfile.update({ where, data });
      const idx = globalForPrisma.dbStore.driverProfiles.findIndex((d: any) => (where.id && d.id === where.id) || (where.userId && d.userId === where.userId));
      if (idx >= 0) {
        globalForPrisma.dbStore.driverProfiles[idx] = { ...globalForPrisma.dbStore.driverProfiles[idx], ...data, updatedAt: new Date() };
        return globalForPrisma.dbStore.driverProfiles[idx];
      }
      return null;
    },
  },

  driverTripAssignment: {
    async findMany({ where }: any = {}) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma as any).driverTripAssignment.findMany({ where, include: { driver: true } });
      let list = [...globalForPrisma.dbStore.driverAssignments];
      if (where?.driverId) list = list.filter((a) => a.driverId === where.driverId);
      if (where?.bookingId) list = list.filter((a) => a.bookingId === where.bookingId);
      return list;
    },
    async create({ data }: any) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma as any).driverTripAssignment.create({ data });
      const id = data.id || `dta-${Date.now()}`;
      const assign = { ...data, id, createdAt: new Date(), updatedAt: new Date() };
      globalForPrisma.dbStore.driverAssignments.push(assign);
      return assign;
    },
    async update({ where, data }: any) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma as any).driverTripAssignment.update({ where, data });
      const idx = globalForPrisma.dbStore.driverAssignments.findIndex((a: any) => a.id === where.id);
      if (idx >= 0) {
        globalForPrisma.dbStore.driverAssignments[idx] = { ...globalForPrisma.dbStore.driverAssignments[idx], ...data, updatedAt: new Date() };
        return globalForPrisma.dbStore.driverAssignments[idx];
      }
      return null;
    },
  },

  // Compliance Rules & Versions
  complianceRule: {
    async findMany({ where }: any = {}) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma as any).complianceRule.findMany({ where, include: { versions: true } });
      let list = [...globalForPrisma.dbStore.complianceRules];
      if (where?.jurisdictionState) list = list.filter((r) => r.jurisdictionState === where.jurisdictionState);
      if (where?.vehicleCategory) list = list.filter((r) => r.vehicleCategory === where.vehicleCategory);
      if (where?.rentalModel) list = list.filter((r) => r.rentalModel === where.rentalModel);
      if (where?.status) list = list.filter((r) => r.status === where.status);
      return list;
    },
    async findUnique({ where }: any) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma as any).complianceRule.findUnique({ where, include: { versions: true } });
      return globalForPrisma.dbStore.complianceRules.find((r: any) => (where.id && r.id === where.id) || (where.ruleId && r.ruleId === where.ruleId)) || null;
    },
    async create({ data }: any) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma as any).complianceRule.create({ data });
      const id = data.id || `cr-${Date.now()}`;
      const rule = { ...data, id, createdAt: new Date(), updatedAt: new Date() };
      globalForPrisma.dbStore.complianceRules.push(rule);
      return rule;
    },
    async update({ where, data }: any) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma as any).complianceRule.update({ where, data });
      const idx = globalForPrisma.dbStore.complianceRules.findIndex((r: any) => (where.id && r.id === where.id) || (where.ruleId && r.ruleId === where.ruleId));
      if (idx >= 0) {
        globalForPrisma.dbStore.complianceRules[idx] = { ...globalForPrisma.dbStore.complianceRules[idx], ...data, updatedAt: new Date() };
        return globalForPrisma.dbStore.complianceRules[idx];
      }
      return null;
    },
  },

  complianceRuleVersion: {
    async create({ data }: any) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma as any).complianceRuleVersion.create({ data });
      const id = data.id || `crv-${Date.now()}`;
      const v = { ...data, id, createdAt: new Date() };
      globalForPrisma.dbStore.complianceVersions.push(v);
      return v;
    },
    async findMany({ where }: any = {}) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma as any).complianceRuleVersion.findMany({ where });
      return [...globalForPrisma.dbStore.complianceVersions];
    },
  },

  // Document Expiry Notifications
  documentExpiryNotification: {
    async findMany({ where }: any = {}) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma as any).documentExpiryNotification.findMany({ where });
      let list = [...globalForPrisma.dbStore.expiryNotifications];
      if (where?.entityType) list = list.filter((n) => n.entityType === where.entityType);
      if (where?.threshold) list = list.filter((n) => n.threshold === where.threshold);
      return list;
    },
    async create({ data }: any) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma as any).documentExpiryNotification.create({ data });
      const id = data.id || `exp-${Date.now()}`;
      const n = { ...data, id, notifiedAt: new Date() };
      globalForPrisma.dbStore.expiryNotifications.unshift(n);
      return n;
    },
  },

  // Handover & Return
  bookingHandover: {
    async findUnique({ where }: any) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma as any).bookingHandover.findUnique({ where });
      return globalForPrisma.dbStore.handovers.find((h: any) => (where.bookingId && h.bookingId === where.bookingId) || (where.id && h.id === where.id)) || null;
    },
    async create({ data }: any) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma as any).bookingHandover.create({ data });
      const id = data.id || `ho-${Date.now()}`;
      const ho = { ...data, id, completedAt: new Date() };
      globalForPrisma.dbStore.handovers.push(ho);
      return ho;
    },
  },

  bookingReturnRecord: {
    async findUnique({ where }: any) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma as any).bookingReturnRecord.findUnique({ where });
      return globalForPrisma.dbStore.returns.find((r: any) => (where.bookingId && r.bookingId === where.bookingId) || (where.id && r.id === where.id)) || null;
    },
    async create({ data }: any) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma as any).bookingReturnRecord.create({ data });
      const id = data.id || `ret-${Date.now()}`;
      const ret = { ...data, id, completedAt: new Date() };
      globalForPrisma.dbStore.returns.push(ret);
      return ret;
    },
  },

  // Incident Reports
  incidentReport: {
    async findMany({ where }: any = {}) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma as any).incidentReport.findMany({ where, include: { attachments: true }, orderBy: { createdAt: 'desc' } });
      let list = [...globalForPrisma.dbStore.incidents];
      if (where?.status) list = list.filter((i) => i.status === where.status);
      if (where?.priority) list = list.filter((i) => i.priority === where.priority);
      return list;
    },
    async findUnique({ where }: any) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma as any).incidentReport.findUnique({ where, include: { attachments: true } });
      return globalForPrisma.dbStore.incidents.find((i: any) => i.id === where.id) || null;
    },
    async create({ data }: any) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma as any).incidentReport.create({ data });
      const id = data.id || `inc-${Date.now()}`;
      const inc = { ...data, id, createdAt: new Date(), updatedAt: new Date(), attachments: [] };
      globalForPrisma.dbStore.incidents.unshift(inc);
      return inc;
    },
    async update({ where, data }: any) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma as any).incidentReport.update({ where, data });
      const idx = globalForPrisma.dbStore.incidents.findIndex((i: any) => i.id === where.id);
      if (idx >= 0) {
        globalForPrisma.dbStore.incidents[idx] = { ...globalForPrisma.dbStore.incidents[idx], ...data, updatedAt: new Date() };
        return globalForPrisma.dbStore.incidents[idx];
      }
      return null;
    },
  },

  // Support Tickets & Messages
  supportTicket: {
    async findMany({ where }: any = {}) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma as any).supportTicket.findMany({ where, include: { messages: true }, orderBy: { updatedAt: 'desc' } });
      let list = [...globalForPrisma.dbStore.supportTickets];
      if (where?.raisedBy) list = list.filter((t) => t.raisedBy === where.raisedBy);
      if (where?.status) list = list.filter((t) => t.status === where.status);
      return list.map((t) => ({
        ...t,
        messages: globalForPrisma.dbStore.supportMessages.filter((m: any) => m.ticketId === t.id),
      }));
    },
    async findUnique({ where }: any) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma as any).supportTicket.findUnique({ where, include: { messages: true } });
      const t = globalForPrisma.dbStore.supportTickets.find((tick: any) => tick.id === where.id || tick.ticketNumber === where.ticketNumber);
      if (!t) return null;
      return {
        ...t,
        messages: globalForPrisma.dbStore.supportMessages.filter((m: any) => m.ticketId === t.id),
      };
    },
    async create({ data }: any) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma as any).supportTicket.create({ data });
      const id = data.id || `tkt-${Date.now().toString().slice(-6)}`;
      const num = `VL-TKT-${Math.floor(10000 + Math.random() * 90000)}`;
      const ticket = { ...data, id, ticketNumber: num, createdAt: new Date(), updatedAt: new Date() };
      globalForPrisma.dbStore.supportTickets.unshift(ticket);
      return ticket;
    },
    async update({ where, data }: any) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma as any).supportTicket.update({ where, data });
      const idx = globalForPrisma.dbStore.supportTickets.findIndex((t: any) => t.id === where.id);
      if (idx >= 0) {
        globalForPrisma.dbStore.supportTickets[idx] = { ...globalForPrisma.dbStore.supportTickets[idx], ...data, updatedAt: new Date() };
        return globalForPrisma.dbStore.supportTickets[idx];
      }
      return null;
    },
  },

  supportMessage: {
    async create({ data }: any) {
      const isConnected = await checkPostgresConnection();
      if (isConnected) return (prisma as any).supportMessage.create({ data });
      const id = data.id || `msg-${Date.now()}`;
      const msg = { ...data, id, createdAt: new Date() };
      globalForPrisma.dbStore.supportMessages.push(msg);
      // update ticket updatedAt
      const tIdx = globalForPrisma.dbStore.supportTickets.findIndex((t: any) => t.id === data.ticketId);
      if (tIdx >= 0) {
        globalForPrisma.dbStore.supportTickets[tIdx].updatedAt = new Date();
      }
      return msg;
    },
  },

  // Transaction helper (runs atomic callback)
  async $transaction(callback: (tx: typeof db) => Promise<any>) {
    const isConnected = await checkPostgresConnection();
    if (isConnected) {
      return prisma.$transaction(async (pTx) => {
        // Delegate to Prisma transaction
        return callback(db);
      });
    }
    // In-memory sequential execution
    return callback(db);
  },
};
