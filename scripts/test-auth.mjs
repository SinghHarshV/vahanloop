/**
 * VahanLoop Automated Authentication & Database Verification Unit Tests
 */

import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { db } from '../src/lib/db.ts';
import { registerSchema, loginSchema } from '../src/lib/validations.ts';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'vahanloop_dev_jwt_secret_key_minimum_32_chars_random_safe'
);

console.log('\n======================================================');
console.log(' VahanLoop Authentication & Database Unit Tests ');
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
  console.log('--- 1. Testing Validation Schemas (Sanitization & Normalization) ---');

  // Customer registration payload
  const custRes = registerSchema.safeParse({
    fullName: 'heer',
    email: ' love@gmail.com ',
    phone: '+91 9151420918',
    password: 'Password123!',
    role: 'customer',
  });
  assert(custRes.success, 'Validates and accepts customer registration with lowercase role');
  assert(custRes.data?.role === 'CUSTOMER', 'Normalizes role to uppercase CUSTOMER');
  assert(custRes.data?.phone === '+919151420918', 'Sanitizes phone number by removing spaces');
  assert(custRes.data?.email === 'love@gmail.com', 'Sanitizes email by trimming whitespace');

  // Owner registration payload
  const ownerRes = registerSchema.safeParse({
    fullName: 'Fleet Host',
    email: 'host@vahanloop.in',
    phone: '+91-98765-43210',
    password: 'Password123!',
    role: 'owner',
    ownerType: 'INDIVIDUAL',
  });
  assert(ownerRes.success, 'Validates and accepts owner registration with hyphens in phone');
  assert(ownerRes.data?.role === 'OWNER', 'Normalizes role to uppercase OWNER');
  assert(ownerRes.data?.phone === '+919876543210', 'Sanitizes phone number by removing hyphens');

  // Invalid payload checks
  const shortPass = registerSchema.safeParse({
    fullName: 'Test User',
    email: 'test@gmail.com',
    phone: '9876543210',
    password: '123',
    role: 'CUSTOMER',
  });
  assert(!shortPass.success, 'Rejects password shorter than 6 characters');

  const invalidEmail = registerSchema.safeParse({
    fullName: 'Test User',
    email: 'not-an-email',
    phone: '9876543210',
    password: 'Password123!',
  });
  assert(!invalidEmail.success, 'Rejects malformed email address');

  // Login schema
  const loginRes = loginSchema.safeParse({
    email: ' Customer@vahanloop.demo ',
    password: 'Demo@123456',
  });
  assert(loginRes.success, 'Validates and sanitizes login email');
  assert(loginRes.data?.email === 'customer@vahanloop.demo', 'Lowercases and trims login email');

  console.log('\n--- 2. Testing Database In-Memory Store & Demo Accounts ---');

  // Check demo accounts in store
  const demoUsers = [
    { email: 'customer@vahanloop.demo', role: 'CUSTOMER' },
    { email: 'owner@vahanloop.demo', role: 'OWNER' },
    { email: 'admin@vahanloop.demo', role: 'ADMIN' },
  ];

  for (const demo of demoUsers) {
    const user = await db.user.findUnique({ where: { email: demo.email } });
    assert(!!user, `Found demo account for ${demo.email}`);
    assert(user?.roles?.includes(demo.role) || user?.roles?.some?.((r) => r.role === demo.role), `Demo account has ${demo.role} role`);

    const validPassword = await bcrypt.compare('Demo@123456', user.passwordHash);
    assert(validPassword, `Demo password matches for ${demo.email}`);
  }

  console.log('\n--- 3. Testing User Registration & Persistence in db.ts ---');

  const newEmail = `user_${Date.now()}@vahanloop.test`;
  const newPhone = `+91${Math.floor(6000000000 + Math.random() * 3999999999)}`;
  const passwordHash = await bcrypt.hash('SecretPass123!', 10);

  const createdUser = await db.user.create({
    data: {
      fullName: 'New Customer',
      email: newEmail,
      phone: newPhone,
      passwordHash,
      accountStatus: 'ACTIVE',
      roles: { create: [{ role: 'CUSTOMER' }] },
    },
  });

  assert(!!createdUser?.id, `Created user successfully with id: ${createdUser.id}`);
  assert(createdUser.email === newEmail, 'Stored user email matches input');

  // Find by email
  const foundByEmail = await db.user.findUnique({ where: { email: newEmail } });
  assert(foundByEmail?.id === createdUser.id, 'Can find newly created user by email');

  // Find by phone
  const foundByPhone = await db.user.findUnique({ where: { phone: newPhone } });
  assert(foundByPhone?.id === createdUser.id, 'Can find newly created user by phone');

  // Verify password
  const newPassValid = await bcrypt.compare('SecretPass123!', foundByEmail.passwordHash);
  assert(newPassValid, 'Newly registered user password matches correctly');

  const wrongPass = await bcrypt.compare('WrongPassword!', foundByEmail.passwordHash);
  assert(!wrongPass, 'Rejects incorrect password');

  console.log('\n--- 4. Testing JWT Session Token Issuance & Verification ---');

  const token = await new SignJWT({
    userId: createdUser.id,
    email: createdUser.email,
    fullName: createdUser.fullName,
    phone: createdUser.phone,
    roles: ['CUSTOMER'],
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);

  assert(typeof token === 'string' && token.length > 20, 'Generates signed JWT token');

  const { payload } = await jwtVerify(token, JWT_SECRET);
  assert(payload?.userId === createdUser.id, 'Verified JWT payload matches user ID');
  assert(payload?.email === createdUser.email, 'Verified JWT payload matches user email');

  console.log(`\n======================================================`);
  console.log(` Test Summary: ${passed} Passed | ${failed} Failed `);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Unhandled error in test:', err);
  process.exit(1);
});
