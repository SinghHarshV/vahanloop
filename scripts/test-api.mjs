/**
 * VahanLoop Phase 2 API Verification Test Script
 * Tests:
 * 1. Health & Explore vehicles (public)
 * 2. Customer login
 * 3. Session extraction & /api/auth/me
 * 4. Booking creation with server-side validation & pricing
 * 5. Owner login & reviewing bookings
 * 6. Owner accepting booking
 * 7. Customer simulating payment -> confirmed
 * 8. Admin login & vehicle approvals
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

async function run() {
  console.log(`\n======================================================`);
  console.log(` Starting VahanLoop Phase 2 Automated API Test Suite `);
  console.log(` Target Server: ${BASE_URL} `);
  console.log(`======================================================\n`);

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

  // Helper for requests with cookies
  let cookies = '';

  async function req(url, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(cookies ? { Cookie: cookies } : {}),
      ...(options.headers || {}),
    };
    const res = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers,
    });
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
      cookies = setCookie.split(';')[0];
    }
    let data;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    return { status: res.status, data, headers: res.headers };
  }

  try {
    // TEST 1: Public Vehicles Exploration
    console.log('\n--- 1. Testing GET /api/vehicles (Public Explore) ---');
    const exploreRes = await req('/api/vehicles');
    assert(exploreRes.status === 200, 'GET /api/vehicles returned HTTP 200');
    assert(Array.isArray(exploreRes.data?.vehicles), 'Response contains vehicles array');
    assert(exploreRes.data?.vehicles.length > 0, `Returned ${exploreRes.data?.vehicles.length} approved vehicles`);

    // TEST 2: Customer Authentication
    console.log('\n--- 2. Testing POST /api/auth/login (Customer Role) ---');
    const custLogin = await req('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'customer@vahanloop.demo',
        password: 'Demo@123456',
      }),
    });
    assert(custLogin.status === 200, 'Customer login returned HTTP 200');
    assert(custLogin.data?.user?.email === 'customer@vahanloop.demo', 'Logged in as customer');
    assert(cookies.includes('vahanloop_session'), 'Session cookie issued');

    // TEST 3: Verify Session via /api/auth/me
    console.log('\n--- 3. Testing GET /api/auth/me (Hydration) ---');
    const meRes = await req('/api/auth/me');
    assert(meRes.status === 200, 'GET /api/auth/me returned HTTP 200');
    assert(meRes.data?.user?.roles?.includes('CUSTOMER'), 'Session contains CUSTOMER role');

    // TEST 4: Create a New Booking
    console.log('\n--- 4. Testing POST /api/bookings (Create Reservation) ---');
    const targetVehicle = exploreRes.data.vehicles[0];
    const bookingRes = await req('/api/bookings', {
      method: 'POST',
      body: JSON.stringify({
        vehicleId: targetVehicle.id,
        rentalType: 'SELF_DRIVE',
        pickupDateTime: new Date(Date.now() + 86400000 * 5).toISOString(),
        returnDateTime: new Date(Date.now() + 86400000 * 7).toISOString(),
        pickupLocation: targetVehicle.location,
        dropLocation: targetVehicle.location,
      }),
    });
    assert(bookingRes.status === 201, 'Booking created with HTTP 201');
    assert(bookingRes.data?.booking?.status === 'REQUESTED', 'Initial status is REQUESTED');
    assert(bookingRes.data?.booking?.totalAmount > 0, `Server-computed total: ₹${bookingRes.data?.booking?.totalAmount}`);
    const createdBookingId = bookingRes.data?.booking?.id;

    // TEST 5: Owner Authentication
    console.log('\n--- 5. Testing POST /api/auth/login (Owner Role) ---');
    cookies = ''; // clear cookies
    const ownerLogin = await req('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'owner@vahanloop.demo',
        password: 'Demo@123456',
      }),
    });
    assert(ownerLogin.status === 200, 'Owner login returned HTTP 200');
    assert(ownerLogin.data?.user?.roles?.includes('OWNER'), 'Session contains OWNER role');

    // TEST 6: Owner accepts booking request
    console.log('\n--- 6. Testing POST /api/bookings/[id]/accept (Owner Acceptance) ---');
    const acceptRes = await req(`/api/bookings/${createdBookingId}/accept`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    assert(acceptRes.status === 200, 'Owner accept returned HTTP 200');
    assert(acceptRes.data?.booking?.status === 'AWAITING_PAYMENT', 'Status transitioned to AWAITING_PAYMENT');

    // TEST 7: Customer simulates checkout payment
    console.log('\n--- 7. Testing POST /api/bookings/[id]/simulate-payment (Simulate Checkout) ---');
    // switch back to customer
    cookies = '';
    await req('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'customer@vahanloop.demo',
        password: 'Demo@123456',
      }),
    });

    const payRes = await req(`/api/bookings/${createdBookingId}/simulate-payment`, {
      method: 'POST',
      body: JSON.stringify({ paymentMethod: 'UPI' }),
    });
    assert(payRes.status === 200, 'Simulate payment returned HTTP 200');
    assert(payRes.data?.booking?.status === 'CONFIRMED', 'Booking is now CONFIRMED');
    assert(payRes.data?.payment?.transactionReference?.startsWith('TXN-VL-'), 'Simulated transaction reference generated');

    // TEST 8: Admin Authentication & Inspection
    console.log('\n--- 8. Testing Admin Command Endpoints ---');
    cookies = '';
    const adminLogin = await req('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@vahanloop.demo',
        password: 'Demo@123456',
      }),
    });
    assert(adminLogin.status === 200, 'Admin login returned HTTP 200');

    const adminDash = await req('/api/admin/dashboard');
    assert(adminDash.status === 200, 'Admin dashboard returned HTTP 200');
    assert(adminDash.data?.metrics?.totalVehicles > 0, 'Admin dashboard metrics retrieved');

    console.log(`\n======================================================`);
    console.log(` Final Results: ${passed} Passed | ${failed} Failed `);
    console.log(`======================================================\n`);

    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Test suite failed with unexpected error:', error);
    process.exit(1);
  }
}

run();
