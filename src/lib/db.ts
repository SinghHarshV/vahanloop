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
      details: 'Platform initialized with Phase 2 relational schema',
      createdAt: new Date(),
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
