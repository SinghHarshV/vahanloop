import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding PostgreSQL database with VahanLoop Phase 2 datasets...');

  const passwordHash = await bcrypt.hash('Demo@123456', 10);

  // 1. Users & Roles
  console.log('Creating demo users...');

  // Customer
  const customer = await prisma.user.upsert({
    where: { email: 'customer@vahanloop.demo' },
    update: {},
    create: {
      id: 'usr-customer-1',
      fullName: 'Rahul Sharma',
      email: 'customer@vahanloop.demo',
      phone: '+919876543210',
      passwordHash,
      accountStatus: 'ACTIVE',
      roles: {
        create: [{ role: 'CUSTOMER' }],
      },
    },
  });

  // Owner
  const owner = await prisma.user.upsert({
    where: { email: 'owner@vahanloop.demo' },
    update: {},
    create: {
      id: 'usr-owner-1',
      fullName: 'Vikramaditya Verma',
      email: 'owner@vahanloop.demo',
      phone: '+919123456789',
      passwordHash,
      accountStatus: 'ACTIVE',
      roles: {
        create: [{ role: 'OWNER' }, { role: 'CUSTOMER' }],
      },
      ownerProfile: {
        create: {
          id: 'own-prof-1',
          ownerType: 'INDIVIDUAL',
          verificationStatus: 'VERIFIED',
        },
      },
    },
  });

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@vahanloop.demo' },
    update: {},
    create: {
      id: 'usr-admin-1',
      fullName: 'Priya Deshmukh',
      email: 'admin@vahanloop.demo',
      phone: '+919988776655',
      passwordHash,
      accountStatus: 'ACTIVE',
      roles: {
        create: [{ role: 'ADMIN' }],
      },
    },
  });

  console.log(`Created users: ${customer.email}, ${owner.email}, ${admin.email}`);

  // 2. Vehicles
  console.log('Creating vehicles catalogue...');
  const vehiclesData = [
    {
      id: 'veh-car-01',
      ownerId: owner.id,
      category: 'CAR',
      make: 'Hyundai',
      model: 'i20 Asta (O)',
      registrationNumber: 'KA-01-MJ-5421',
      manufacturingYear: 2023,
      fuelType: 'PETROL',
      transmission: 'MANUAL',
      seatingCapacity: 5,
      description: 'Immaculately maintained premium hatchback with electric sunroof, Bose 7-speaker audio, and digital cluster.',
      location: 'Indiranagar, Bengaluru',
      latitude: 12.9784,
      longitude: 77.6408,
      dailyRentalPrice: 1800,
      driverCharge: 700,
      selfDriveEnabled: true,
      chauffeurEnabled: true,
      approvalStatus: 'APPROVED',
      availabilityStatus: 'AVAILABLE',
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80', imageType: 'COVER' },
      ],
      documents: [
        { documentType: 'RC', verificationStatus: 'VERIFIED' },
        { documentType: 'INSURANCE', verificationStatus: 'VERIFIED' },
      ],
    },
    {
      id: 'veh-car-02',
      ownerId: owner.id,
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
      availabilityStatus: 'AVAILABLE',
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80', imageType: 'COVER' },
      ],
      documents: [
        { documentType: 'RC', verificationStatus: 'VERIFIED' },
      ],
    },
    {
      id: 'veh-car-03',
      ownerId: owner.id,
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
      availabilityStatus: 'AVAILABLE',
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop&q=80', imageType: 'COVER' },
      ],
      documents: [
        { documentType: 'RC', verificationStatus: 'VERIFIED' },
      ],
    },
    {
      id: 'veh-car-04',
      ownerId: owner.id,
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
      availabilityStatus: 'AVAILABLE',
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop&q=80', imageType: 'COVER' },
      ],
      documents: [
        { documentType: 'RC', verificationStatus: 'VERIFIED' },
      ],
    },
    {
      id: 'veh-bike-01',
      ownerId: owner.id,
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
      availabilityStatus: 'AVAILABLE',
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80', imageType: 'COVER' },
      ],
      documents: [
        { documentType: 'RC', verificationStatus: 'VERIFIED' },
      ],
    },
    {
      id: 'veh-bike-02',
      ownerId: owner.id,
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
      availabilityStatus: 'AVAILABLE',
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80', imageType: 'COVER' },
      ],
      documents: [
        { documentType: 'RC', verificationStatus: 'VERIFIED' },
      ],
    },
    {
      id: 'veh-scooter-01',
      ownerId: owner.id,
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
      availabilityStatus: 'AVAILABLE',
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1571188654248-7a89213915f7?w=800&auto=format&fit=crop&q=80', imageType: 'COVER' },
      ],
      documents: [
        { documentType: 'RC', verificationStatus: 'VERIFIED' },
      ],
    },
    {
      id: 'veh-scooter-02',
      ownerId: owner.id,
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
      availabilityStatus: 'AVAILABLE',
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80', imageType: 'COVER' },
      ],
      documents: [
        { documentType: 'RC', verificationStatus: 'VERIFIED' },
      ],
    },
    {
      id: 'veh-car-pending-01',
      ownerId: owner.id,
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
      approvalStatus: 'PENDING',
      availabilityStatus: 'AVAILABLE',
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80', imageType: 'COVER' },
      ],
      documents: [
        { documentType: 'RC', verificationStatus: 'PENDING' },
      ],
    },
  ];

  for (const v of vehiclesData) {
    const { images, documents, ...vehicleFields } = v;
    await prisma.vehicle.upsert({
      where: { id: v.id },
      update: {},
      create: {
        ...vehicleFields,
        images: {
          create: images,
        },
        documents: {
          create: documents,
        },
      },
    });
  }
  console.log(`Seeded ${vehiclesData.length} vehicles.`);

  // 3. Bookings & Payments
  console.log('Creating sample bookings...');
  const sampleBooking = await prisma.booking.upsert({
    where: { id: 'bk-demo-101' },
    update: {},
    create: {
      id: 'bk-demo-101',
      customerId: customer.id,
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
      payments: {
        create: [
          {
            id: 'pay-1',
            amount: 5960,
            paymentMethod: 'UPI',
            paymentStatus: 'COMPLETED',
            transactionReference: 'TXN-VL-89421-DEMO',
          },
        ],
      },
      statusHistory: {
        create: [
          {
            previousStatus: 'AWAITING_PAYMENT',
            newStatus: 'CONFIRMED',
            changedBy: customer.id,
            note: 'Simulated payment completed',
          },
        ],
      },
    },
  });

  console.log(`Seeded booking ${sampleBooking.id} with simulated payment.`);
  console.log('Database seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
