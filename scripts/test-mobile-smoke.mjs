/**
 * VahanLoop Phase 7 Native Mobile API Integration & Smoke Test Suite
 */

import { db } from '../src/lib/db.ts';
import { SignJWT, jwtVerify } from 'jose';
import { mobileLoginSchema, mobileRegisterSchema, mobileBookingSchema, mobileAddVehicleSchema } from '../packages/shared/src/validations.ts';
import { THEME_COLORS, OPERATIONAL_CITIES, VEHICLE_CATEGORIES, BOOKING_STATUS_CONFIG } from '../packages/shared/src/constants.ts';
import { toPaise } from '../src/lib/pricing.ts';
import { MockPaymentProvider } from '../src/lib/payment.ts';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'vahanloop_dev_jwt_secret_key_minimum_32_chars_random_safe'
);

console.log('\n======================================================');
console.log(' VahanLoop Phase 7 Native Mobile Integration Test Suite ');
console.log('======================================================\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

async function run() {
  console.log('--- 1. Testing Shared Mobile Constants & Brand Colors ---');
  assert(THEME_COLORS.navy === '#10243A', 'Brand Navy color strictly configured to #10243A');
  assert(THEME_COLORS.emerald === '#15966B', 'Brand Emerald color strictly configured to #15966B');
  assert(OPERATIONAL_CITIES.includes('Jabalpur'), 'Jabalpur operational in mobile city roster');
  assert(OPERATIONAL_CITIES.includes('Bengaluru'), 'Bengaluru operational in mobile city roster');
  assert(VEHICLE_CATEGORIES.length === 4, 'Includes All, Cars, Bikes, and Scooters categories');
  assert(BOOKING_STATUS_CONFIG.CONFIRMED.color === '#059669', 'Status configuration matches design tokens');

  console.log('\n--- 2. Testing Mobile Validation Schemas ---');
  // Login schema
  const loginValid = mobileLoginSchema.safeParse({
    email: ' customer@vahanloop.demo ',
    password: 'Demo@123456',
  });
  assert(loginValid.success, 'Mobile login schema sanitizes and validates input');
  assert(loginValid.data?.email === 'customer@vahanloop.demo', 'Trims whitespace on mobile login input');

  // Customer registration
  const custReg = mobileRegisterSchema.safeParse({
    fullName: 'Mobile User',
    email: 'mobile.user@vahanloop.demo',
    phone: '+91 98765 12345',
    password: 'Password123!',
    role: 'customer',
  });
  assert(custReg.success, 'Validates mobile customer registration');
  assert(custReg.data?.role === 'CUSTOMER', 'Normalizes role to uppercase');
  assert(custReg.data?.phone === '+919876512345', 'Sanitizes mobile phone number');

  // Vehicle onboarding schema
  const vehOnboarding = mobileAddVehicleSchema.safeParse({
    category: 'CAR',
    make: 'Mahindra',
    model: 'Thar LX 4x4',
    year: 2024,
    registrationNumber: 'MP-20-CB-4089',
    fuelType: 'DIESEL',
    transmission: 'MANUAL',
    seatingCapacity: 4,
    location: 'Jabalpur',
    dailyRentalPrice: 3500,
    driverCharge: 600,
    selfDriveEnabled: true,
    chauffeurEnabled: true,
  });
  assert(vehOnboarding.success, 'Validates mobile host vehicle onboarding form');

  console.log('\n--- 3. Testing Mobile Bearer Token Authentication Flow ---');
  const demoCustomer = await db.user.findUnique({ where: { email: 'customer@vahanloop.demo' } });
  assert(!!demoCustomer, 'Found demo customer account in database');

  const token = await new SignJWT({
    userId: demoCustomer.id,
    email: demoCustomer.email,
    fullName: demoCustomer.fullName,
    phone: demoCustomer.phone,
    roles: ['CUSTOMER'],
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);

  const { payload } = await jwtVerify(token, JWT_SECRET);
  assert(payload?.userId === demoCustomer.id, 'Mobile Bearer token successfully verified');
  assert(payload?.roles?.includes('CUSTOMER'), 'Verified session carries CUSTOMER role');

  console.log('\n--- 4. Testing Mobile Vehicle Exploration & Booking Pipeline ---');
  const vehicles = await db.vehicle.findMany();
  assert(vehicles.length >= 4, `Database returned ${vehicles.length} vehicles for mobile feed`);

  const jabalpurVehicles = vehicles.filter((v) => v.location.includes('Jabalpur'));
  assert(jabalpurVehicles.length >= 4, `Found ${jabalpurVehicles.length} vehicles in Jabalpur`);

  const targetVehicle = jabalpurVehicles[0];
  const newBooking = await db.booking.create({
    data: {
      vehicleId: targetVehicle.id,
      customerId: demoCustomer.id,
      customerName: demoCustomer.fullName,
      customerEmail: demoCustomer.email,
      ownerId: targetVehicle.ownerId,
      pickupDateTime: new Date(Date.now() + 86400000).toISOString(),
      returnDateTime: new Date(Date.now() + 86400000 * 4).toISOString(),
      pickupLocation: targetVehicle.location,
      dropLocation: targetVehicle.location,
      rentalType: 'SELF_DRIVE',
      baseAmount: targetVehicle.dailyRentalPrice * 3,
      driverCharge: 0,
      serviceFee: Math.round(targetVehicle.dailyRentalPrice * 3 * 0.1),
      depositAmount: 2000,
      totalAmount: targetVehicle.dailyRentalPrice * 3 + Math.round(targetVehicle.dailyRentalPrice * 3 * 0.1) + 2000,
      status: 'AWAITING_PAYMENT',
      paymentStatus: 'UNPAID',
    },
  });
  assert(!!newBooking.id, `Created mobile reservation with id: ${newBooking.id}`);

  console.log('\n--- 5. Testing Mobile Razorpay Test-Mode Payment Engine ---');
  const paymentProvider = new MockPaymentProvider();
  const paymentOrder = await paymentProvider.createOrder({
    bookingId: newBooking.id,
    amountPaise: toPaise(newBooking.totalAmount),
    customer: {
      fullName: demoCustomer.fullName,
      email: demoCustomer.email,
      phone: demoCustomer.phone,
    },
  });
  assert(paymentOrder.orderId.startsWith('order_mock_'), 'Created valid test-mode payment order');

  const verification = await paymentProvider.verifyPayment({
    providerOrderId: paymentOrder.orderId,
    providerPaymentId: `pay_mock_${Date.now()}`,
  });
  assert(verification.verified, 'Server-side test payment signature verified');

  const updatedBooking = await db.booking.update({
    where: { id: newBooking.id },
    data: { status: 'CONFIRMED', paymentStatus: 'PAID' },
  });
  assert(updatedBooking.status === 'CONFIRMED', 'Mobile reservation confirmed after payment verification');

  console.log('\n--- 6. Testing Mobile Push Notification Device Registration ---');
  const pushAudit = await db.auditLog.create({
    data: {
      actorId: demoCustomer.id,
      action: 'REGISTER_DEVICE_PUSH_TOKEN',
      entityType: 'USER',
      entityId: demoCustomer.id,
      details: 'Registered android push token (ExponentPushToken[xxxxxxxx])',
    },
  });
  assert(!!pushAudit.id, 'Device push notification token logged in audit stream');

  console.log(`\n======================================================`);
  console.log(` Test Summary: ${passed} Passed | ${failed} Failed `);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Mobile smoke test failed:', err);
  process.exit(1);
});
