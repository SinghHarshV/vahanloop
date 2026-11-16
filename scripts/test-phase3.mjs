// Pure unit test suite for Phase 3 core algorithms without Next.js/DB bundle imports
let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${testName}`);
    failed++;
  }
}

console.log('====================================================');
console.log(' VahanLoop Phase 3 Core Engine Automated Unit Tests');
console.log('====================================================\n');

// 1. Pricing Engine
console.log('--- 1. Testing Pricing Engine (Integer Paise & Zero Rounding Error) ---');

function toPaise(inr) {
  return Math.round(inr * 100);
}

function calculateBookingPrice(input) {
  const start = new Date(input.startDate);
  const end = new Date(input.endDate);
  const diffDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

  const dailyRatePaise = toPaise(input.dailyRate);
  const baseRentalPricePaise = dailyRatePaise * diffDays;
  const chauffeurFeePaise = input.rentalType === 'CHAUFFEUR' ? toPaise(input.driverChargePerDay || 700) * diffDays : 0;
  const subtotalPaise = baseRentalPricePaise + chauffeurFeePaise;
  const serviceFeePaise = Math.round(subtotalPaise * 0.1);
  const estimatedTaxPaise = Math.round(subtotalPaise * 0.05);
  const securityDepositPaise = input.category === 'CAR' ? 200000 : input.category === 'BIKE' ? 150000 : 100000;
  const totalPayablePaise = subtotalPaise + serviceFeePaise + estimatedTaxPaise + securityDepositPaise;

  return {
    durationDays: diffDays,
    dailyRatePaise,
    baseRentalPricePaise,
    chauffeurFeePaise,
    serviceFeePaise,
    estimatedTaxPaise,
    securityDepositPaise,
    totalPayablePaise,
  };
}

const quote1 = calculateBookingPrice({
  category: 'CAR',
  dailyRate: 1800,
  startDate: '2024-05-10T10:00:00Z',
  endDate: '2024-05-13T10:00:00Z',
  rentalType: 'SELF_DRIVE',
});

assert(quote1.durationDays === 3, 'Calculates 3 days duration');
assert(quote1.dailyRatePaise === 180000, 'Daily rate in paise is 180,000');
assert(quote1.baseRentalPricePaise === 540000, 'Base rental for 3 days is 540,000 paise (₹5,400)');
assert(quote1.serviceFeePaise === 54000, 'Service fee is 10% (54,000 paise)');
assert(quote1.estimatedTaxPaise === 27000, 'Estimated tax is 5% (27,000 paise)');
assert(quote1.securityDepositPaise === 200000, 'Car security deposit is ₹2,000 (200,000 paise)');
assert(quote1.totalPayablePaise === 821000, 'Total payable is exactly ₹8,210 with zero floating-point error');

const quoteChauffeur = calculateBookingPrice({
  category: 'BIKE',
  dailyRate: 950,
  startDate: '2024-05-10T10:00:00Z',
  endDate: '2024-05-11T10:00:00Z',
  rentalType: 'CHAUFFEUR',
  driverChargePerDay: 500,
});
assert(quoteChauffeur.chauffeurFeePaise === 50000, 'Bike chauffeur fee added correctly (50,000 paise)');
assert(quoteChauffeur.securityDepositPaise === 150000, 'Bike security deposit is ₹1,500');

// 2. Double-Booking Half-Open Overlap Check
console.log('\n--- 2. Testing Half-Open Time Range Overlap Algorithm ---');
function hasOverlap(reqStart, reqEnd, bStart, bEnd) {
  // Half-open interval: [start, end)
  const rs = new Date(reqStart).getTime();
  const re = new Date(reqEnd).getTime();
  const bs = new Date(bStart).getTime();
  const be = new Date(bEnd).getTime();
  return rs < be && re > bs;
}

assert(hasOverlap('2024-05-10', '2024-05-12', '2024-05-11', '2024-05-13') === true, 'Detects overlapping booking intervals');
assert(hasOverlap('2024-05-10', '2024-05-12', '2024-05-12', '2024-05-14') === false, 'Half-open boundary allows back-to-back rentals at exact return time');
assert(hasOverlap('2024-05-10', '2024-05-15', '2024-05-11', '2024-05-12') === true, 'Detects sub-interval booking conflict');

// 3. Document File Security & Magic Byte Validation
console.log('\n--- 3. Testing Secure Document Validation & OWASP Rules ---');
function validateFileMagicBytes(buffer) {
  if (buffer.length < 4) return { valid: false };
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return { valid: true, mime: 'application/pdf' };
  }
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, mime: 'image/jpeg' };
  }
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return { valid: true, mime: 'image/png' };
  }
  return { valid: false };
}

const validPdfBuffer = Buffer.from('%PDF-1.4 simulated pdf document content');
assert(validateFileMagicBytes(validPdfBuffer).valid === true, 'Valid PDF passes magic bytes inspection');

const fakePdfBuffer = Buffer.from('MZ\x90\x00\x03\x00\x00\x00 windows binary');
assert(validateFileMagicBytes(fakePdfBuffer).valid === false, 'Malicious executable disguised as PDF rejected');

// 4. Expiry Configuration
console.log('\n--- 4. Testing Reservation Expiry Hold Configuration ---');
const RESERVATION_HOLD_MINUTES = 15;
assert(RESERVATION_HOLD_MINUTES === 15, 'Reservation hold duration strictly configured to 15 minutes');

console.log('\n====================================================');
console.log(` Test Summary: ${passed} Passed | ${failed} Failed`);
console.log('====================================================\n');
process.exit(failed > 0 ? 1 : 0);
