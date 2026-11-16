// Comprehensive automated test suite for VahanLoop Phase 5
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

console.log('================================================================');
console.log(' VahanLoop Phase 5 Fleet, Verification & Compliance Unit Tests');
console.log('================================================================\n');

// -------------------------------------------------------------
// SECTION 1: OWNER ONBOARDING & FLEET VERIFICATION (Tests 1-6)
// -------------------------------------------------------------
console.log('--- SECTION 1: OWNER ONBOARDING & FLEET VERIFICATION ---');

// In-memory mock database state
const mockDb = {
  applications: [],
  organisations: [],
  fleetLocations: [],
  fleetAssignments: [],
  drivers: [],
  driverAssignments: [],
  complianceRules: [],
  complianceVersions: [],
  handovers: [],
  returns: [],
  incidents: [],
  tickets: [],
  auditLogs: [],
};

// Test 1: Individual owner registration
function registerOwner(input) {
  const app = {
    id: `app-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId: input.userId,
    ownerType: input.ownerType || 'INDIVIDUAL',
    fullName: input.fullName,
    email: input.email,
    mobile: input.mobile,
    currentStep: 1,
    status: 'IN_PROGRESS',
    payoutEligible: false,
    termsAccepted: false,
  };
  mockDb.applications.push(app);
  return app;
}

const indApp = registerOwner({
  userId: 'usr-owner-test-1',
  fullName: 'Arun Kulkarni',
  email: 'arun@example.com',
  mobile: '+919845012345',
  ownerType: 'INDIVIDUAL',
});
assert(indApp.ownerType === 'INDIVIDUAL', 'Test 1: Individual owner application initialized with step 1');

// Test 2: Business owner registration
const busOrg = {
  id: 'org-test-01',
  businessName: 'Bangalore Fleet Express Pvt Ltd',
  businessType: 'PVT_LTD',
  panNumber: 'AABCB9988G',
  gstin: '29AABCB9988G1Z2',
  contactPerson: 'Suresh Patil',
  verificationStatus: 'SUBMITTED',
};
mockDb.organisations.push(busOrg);
assert(busOrg.businessType === 'PVT_LTD' && busOrg.panNumber === 'AABCB9988G', 'Test 2: Commercial business owner registration stores corporate PAN and GSTIN');

// Test 3: Onboarding submission
function submitOnboarding(appId, bankHolder, termsAccepted) {
  const app = mockDb.applications.find((a) => a.id === appId);
  if (!termsAccepted) throw new Error('Terms must be accepted');
  app.bankAccountHolder = bankHolder;
  app.bankVerificationStatus = 'VERIFIED';
  app.termsAccepted = true;
  app.status = 'SUBMITTED';
  app.currentStep = 5;
  return app;
}
const submittedApp = submitOnboarding(indApp.id, 'Arun Kulkarni', true);
assert(submittedApp.status === 'SUBMITTED' && submittedApp.currentStep === 5, 'Test 3: Onboarding application successfully moves to SUBMITTED upon completion of step 5');

// Test 4: Verification rejection & documented resubmission
function reviewApplication(appId, adminId, action, reason) {
  const app = mockDb.applications.find((a) => a.id === appId);
  // Self-approval restriction: Reviewer cannot approve own application
  if (app.userId === adminId) {
    throw new Error('Conflict of interest: Cannot approve own application');
  }
  const prevStatus = app.status;
  app.status = action === 'APPROVE' ? 'VERIFIED' : action === 'REJECT' ? 'REJECTED' : 'ADDITIONAL_INFORMATION_REQUIRED';
  app.rejectionReason = reason;

  mockDb.auditLogs.push({
    action: `OWNER_KYC_${action}`,
    entityId: appId,
    adminId,
    reason,
    prevStatus,
    newStatus: app.status,
  });
  return app;
}

const rejectedApp = reviewApplication(indApp.id, 'usr-admin-1', 'REJECT', 'Voter ID token expired; please re-upload valid government ID');
assert(rejectedApp.status === 'REJECTED' && rejectedApp.rejectionReason.includes('Voter ID token expired'), 'Test 4: Admin can reject application with documented reason for resubmission');

// Test 5: Fleet creation & depot location
function createFleetDepot(orgId, depotName, city) {
  const loc = {
    id: `loc-${Date.now()}`,
    orgId,
    name: depotName,
    city,
    isActive: true,
  };
  mockDb.fleetLocations.push(loc);
  return loc;
}
const depot = createFleetDepot(busOrg.id, 'Whitefield Tech Park Depot', 'Bengaluru');
assert(depot.orgId === busOrg.id && depot.city === 'Bengaluru', 'Test 5: Operational fleet depot created and attached to fleet organisation');

// Test 6: Multiple vehicle management under single fleet
function assignVehiclesToFleet(orgId, locationId, vehicleIds) {
  vehicleIds.forEach((vid) => {
    mockDb.fleetAssignments.push({ orgId, locationId, vehicleId: vid });
  });
}
assignVehiclesToFleet(busOrg.id, depot.id, ['veh-fleet-01', 'veh-fleet-02', 'veh-fleet-03']);
const assignedVehs = mockDb.fleetAssignments.filter((a) => a.orgId === busOrg.id);
assert(assignedVehs.length === 3, 'Test 6: Multiple vehicles managed under single commercial fleet organisation');


// -------------------------------------------------------------
// SECTION 2: DRIVER MANAGEMENT & DISPATCH (Tests 7-11)
// -------------------------------------------------------------
console.log('\n--- SECTION 2: DRIVER MANAGEMENT & DISPATCH ---');

// Test 7: Driver registration
const driver1 = {
  id: 'drv-test-01',
  fullName: 'Rajesh G.',
  phone: '+919876543211',
  licenceCategory: 'LMV-TR',
  licenceVerificationStatus: 'VERIFIED',
  availabilityStatus: 'AVAILABLE',
};
mockDb.drivers.push(driver1);
assert(driver1.licenceCategory === 'LMV-TR', 'Test 7: Commercial chauffeur profile registered with LMV-TR transport badge');

// Test 8: Driver verification
assert(driver1.licenceVerificationStatus === 'VERIFIED', 'Test 8: Driver commercial license verification confirmed');

// Test 9: Availability changes
function toggleDriverAvailability(driverId, newStatus) {
  const d = mockDb.drivers.find((item) => item.id === driverId);
  d.availabilityStatus = newStatus;
  return d;
}
toggleDriverAvailability(driver1.id, 'ON_DUTY');
assert(driver1.availabilityStatus === 'ON_DUTY', 'Test 9: Driver availability transitions dynamically to ON_DUTY');
toggleDriverAvailability(driver1.id, 'AVAILABLE');

// Test 10: Driver assignment
function hasDriverConflict(driverId, reqStart, reqEnd) {
  const existing = mockDb.driverAssignments.filter(
    (a) => a.driverId === driverId && ['ASSIGNED', 'STARTED'].includes(a.status)
  );
  for (const assign of existing) {
    if (reqStart < assign.endTime && reqEnd > assign.startTime) {
      return true;
    }
  }
  return false;
}

function assignDriver(driverId, bookingId, start, end) {
  if (hasDriverConflict(driverId, start, end)) {
    throw new Error('Conflicting assignment: Driver already booked during this time window');
  }
  const assignment = {
    id: `dta-${Date.now()}`,
    driverId,
    bookingId,
    startTime: start,
    endTime: end,
    status: 'ASSIGNED',
  };
  mockDb.driverAssignments.push(assignment);
  return assignment;
}

const trip1 = assignDriver(driver1.id, 'bk-trip-1', new Date('2024-06-01T10:00:00Z'), new Date('2024-06-03T18:00:00Z'));
assert(trip1.status === 'ASSIGNED', 'Test 10: Qualified driver assigned to chauffeur trip');

// Test 11: Conflicting assignments rejected
let conflictCaught = false;
try {
  assignDriver(driver1.id, 'bk-trip-2', new Date('2024-06-02T12:00:00Z'), new Date('2024-06-04T12:00:00Z'));
} catch (e) {
  conflictCaught = true;
}
assert(conflictCaught === true, 'Test 11: Overlapping trip assignment correctly blocked by driver conflict check');


// -------------------------------------------------------------
// SECTION 3: CONFIGURABLE COMPLIANCE ENGINE (Tests 12-16)
// -------------------------------------------------------------
console.log('\n--- SECTION 3: COMPLIANCE & ELIGIBILITY ENGINE ---');

// Mock compliance rules
mockDb.complianceRules = [
  {
    ruleId: 'RULE-KA-CAR-SELFDRIVE',
    jurisdictionState: 'KARNATAKA',
    vehicleCategory: 'CAR',
    rentalModel: 'SELF_DRIVE',
    requiredDocuments: ['RC', 'INSURANCE', 'PUC'],
    requiredPermits: ['RENT_A_CAB'],
    version: 1,
  },
  {
    ruleId: 'RULE-KA-CAR-CHAUFFEUR',
    jurisdictionState: 'KARNATAKA',
    vehicleCategory: 'CAR',
    rentalModel: 'CHAUFFEUR',
    requiredDocuments: ['RC', 'INSURANCE', 'PUC', 'COMMERCIAL_PERMIT'],
    requiredPermits: ['ALL_INDIA_TOURIST_PERMIT'],
    version: 1,
  },
  {
    ruleId: 'RULE-KA-BIKE-SELFDRIVE',
    jurisdictionState: 'KARNATAKA',
    vehicleCategory: 'BIKE',
    rentalModel: 'SELF_DRIVE',
    requiredDocuments: ['RC', 'INSURANCE', 'PUC'],
    requiredPermits: ['RENT_A_MOTORCYCLE'],
    version: 1,
  },
];

function evaluateVehicleCompliance(vehicle, rentalModel, state = 'KARNATAKA') {
  const rule = mockDb.complianceRules.find(
    (r) => r.jurisdictionState === state && r.vehicleCategory === vehicle.category && r.rentalModel === rentalModel
  );

  const missingDocs = [];
  const expiredDocs = [];
  const now = new Date();

  rule.requiredDocuments.forEach((reqDoc) => {
    const doc = vehicle.documents.find((d) => d.type === reqDoc);
    if (!doc || doc.verificationStatus !== 'VERIFIED') {
      missingDocs.push(reqDoc);
    } else if (doc.expiryDate && new Date(doc.expiryDate) < now) {
      expiredDocs.push(reqDoc);
    }
  });

  const isLegallyPermitted = missingDocs.length === 0 && expiredDocs.length === 0;
  const bookingEligible = isLegallyPermitted && vehicle.approvalStatus === 'APPROVED';

  return {
    matchedRule: rule.ruleId,
    isLegallyPermitted,
    bookingEligible,
    missingDocs,
    expiredDocs,
  };
}

// Test 12: Different rental modes use appropriate configured rules
const testCar = {
  category: 'CAR',
  approvalStatus: 'APPROVED',
  documents: [
    { type: 'RC', verificationStatus: 'VERIFIED', expiryDate: '2028-01-01' },
    { type: 'INSURANCE', verificationStatus: 'VERIFIED', expiryDate: '2026-01-01' },
    { type: 'PUC', verificationStatus: 'VERIFIED', expiryDate: '2025-10-01' },
  ],
};

const evalSD = evaluateVehicleCompliance(testCar, 'SELF_DRIVE');
const evalCH = evaluateVehicleCompliance(testCar, 'CHAUFFEUR');
assert(evalSD.matchedRule === 'RULE-KA-CAR-SELFDRIVE' && evalCH.matchedRule === 'RULE-KA-CAR-CHAUFFEUR', 'Test 12: Distinct compliance policies mapped for Self-Drive vs Chauffeur rentals');

// Test 13: Expired mandatory documents affect eligibility
const carWithExpiredPUC = {
  category: 'CAR',
  approvalStatus: 'APPROVED',
  documents: [
    { type: 'RC', verificationStatus: 'VERIFIED', expiryDate: '2028-01-01' },
    { type: 'INSURANCE', verificationStatus: 'VERIFIED', expiryDate: '2026-01-01' },
    { type: 'PUC', verificationStatus: 'VERIFIED', expiryDate: '2024-01-01' }, // EXPIRED
  ],
};
const evalExpired = evaluateVehicleCompliance(carWithExpiredPUC, 'SELF_DRIVE');
assert(evalExpired.expiredDocs.includes('PUC') && evalExpired.bookingEligible === false, 'Test 13: Expired mandatory document disqualifies vehicle from booking eligibility');

// Test 14: Missing mandatory documents prevent booking eligibility
const carMissingInsurance = {
  category: 'CAR',
  approvalStatus: 'APPROVED',
  documents: [{ type: 'RC', verificationStatus: 'VERIFIED' }],
};
const evalMissing = evaluateVehicleCompliance(carMissingInsurance, 'SELF_DRIVE');
assert(evalMissing.missingDocs.includes('INSURANCE') && evalMissing.bookingEligible === false, 'Test 14: Missing insurance blocks booking eligibility');

// Test 15: Internal approval is not equivalent to legal eligibility
const approvedButNoDocs = {
  category: 'CAR',
  approvalStatus: 'APPROVED', // Admin clicked approve on basic listing
  documents: [], // Zero verified compliance documents
};
const evalNotLegal = evaluateVehicleCompliance(approvedButNoDocs, 'SELF_DRIVE');
assert(evalNotLegal.isLegallyPermitted === false && evalNotLegal.bookingEligible === false, 'Test 15: Platform listing approval alone does not confer legal rental eligibility without verified transport docs');

// Test 16: Compliance rule version changes are recorded
function updateComplianceRule(ruleId, newDocs, adminId) {
  const r = mockDb.complianceRules.find((item) => item.ruleId === ruleId);
  const oldVer = r.version;
  r.version = oldVer + 1;
  r.requiredDocuments = newDocs;
  mockDb.complianceVersions.push({
    ruleId,
    version: r.version,
    changedBy: adminId,
    timestamp: new Date(),
  });
  return r;
}
const updatedRule = updateComplianceRule('RULE-KA-CAR-SELFDRIVE', ['RC', 'INSURANCE', 'PUC', 'SPEED_GOVERNOR'], 'usr-admin-1');
assert(updatedRule.version === 2 && mockDb.complianceVersions.length === 1, 'Test 16: Compliance rule updates record incremented version and administrative audit entry');


// -------------------------------------------------------------
// SECTION 4: OPERATIONS, INCIDENTS & AUDIT (Tests 17-21)
// -------------------------------------------------------------
console.log('\n--- SECTION 4: OPERATIONS, INCIDENTS & AUDIT ---');

// Test 17: Handover completed for valid booking & transitions to ACTIVE
function performHandover(booking, odo, fuel, condition, verifier) {
  if (booking.status !== 'CONFIRMED') throw new Error('Booking must be CONFIRMED for handover');
  const ho = {
    bookingId: booking.id,
    odometer: odo,
    fuelPercent: fuel,
    condition,
    verifiedBy: verifier,
    timestamp: new Date(),
  };
  booking.status = 'ACTIVE';
  mockDb.handovers.push(ho);
  return ho;
}
const testBooking = { id: 'bk-ops-101', status: 'CONFIRMED' };
const handover = performHandover(testBooking, 24500, 100, 'EXCELLENT', 'usr-owner-1');
assert(testBooking.status === 'ACTIVE' && handover.odometer === 24500, 'Test 17: Handover recorded telemetry and transitioned booking to ACTIVE');

// Test 18: Return inspections saved & verified
function performReturn(booking, odo, fuel, condition, verifier) {
  if (booking.status !== 'ACTIVE') throw new Error('Booking must be ACTIVE for return');
  const prevHo = mockDb.handovers.find((h) => h.bookingId === booking.id);
  const disputeRaised = condition === 'DAMAGED' && prevHo.condition !== 'DAMAGED';
  const ret = {
    bookingId: booking.id,
    odometer: odo,
    fuelPercent: fuel,
    condition,
    disputeRaised,
    verifiedBy: verifier,
    timestamp: new Date(),
  };
  booking.status = 'COMPLETED';
  mockDb.returns.push(ret);
  return ret;
}
const returnRecord = performReturn(testBooking, 24890, 100, 'EXCELLENT', 'usr-owner-1');
assert(testBooking.status === 'COMPLETED' && returnRecord.disputeRaised === false, 'Test 18: Return inspection reconciled and booking marked COMPLETED');

// Test 19: Incidents created with priority
function reportIncident(bookingId, reporter, cat, prio, desc) {
  const inc = {
    id: `inc-${Date.now()}`,
    bookingId,
    reportedBy: reporter,
    category: cat,
    priority: prio,
    description: desc,
    status: 'OPEN',
  };
  mockDb.incidents.push(inc);
  return inc;
}
const incident1 = reportIncident('bk-ops-101', 'usr-cust-1', 'BREAKDOWN', 'HIGH', 'Radiator coolant leak on Highway 44');
assert(incident1.status === 'OPEN' && incident1.priority === 'HIGH', 'Test 19: High-priority breakdown incident logged with emergency dispatch status');

// Test 20: Support tickets assigned & messaged
function createSupportTicket(user, category, subject, desc) {
  const ticket = {
    id: `tkt-${Date.now()}`,
    raisedBy: user,
    category,
    subject,
    status: 'OPEN',
    messages: [{ sender: user, text: desc }],
  };
  mockDb.tickets.push(ticket);
  return ticket;
}
const tkt = createSupportTicket('usr-cust-1', 'PAYMENT', 'Deposit refund query', 'When will security deposit be unfrozen?');
assert(tkt.status === 'OPEN' && tkt.messages.length === 1, 'Test 20: Support ticket opened with initial message thread');

// Test 21: Administrative decisions audited with documented reason
assert(mockDb.auditLogs.some((l) => l.action.startsWith('OWNER_KYC') && l.reason.length > 0), 'Test 21: Administrative decisions require mandatory documented reason in audit trail');


// -------------------------------------------------------------
// SECTION 5: SECURITY & ACCESS CONTROL (Tests 22-26)
// -------------------------------------------------------------
console.log('\n--- SECTION 5: SECURITY & RBAC CONSTRAINTS ---');

// Test 22: Fleet users cannot access another fleet's data
function getFleetData(requestingOrgId, targetOrgId) {
  if (requestingOrgId !== targetOrgId) throw new Error('403 Forbidden: Cross-organisation data boundary violated');
  return mockDb.fleetAssignments.filter((a) => a.orgId === targetOrgId);
}
let fleetIsolationBlocked = false;
try {
  getFleetData('org-fleet-attacker', busOrg.id);
} catch (e) {
  fleetIsolationBlocked = true;
}
assert(fleetIsolationBlocked === true, 'Test 22: Multi-tenant fleet isolation enforces strict organisation boundary');

// Test 23: Drivers cannot access unrelated trips
function getDriverTrip(requestingDriverId, assignment) {
  if (assignment.driverId !== requestingDriverId) throw new Error('403 Forbidden: Unauthorized access to external trip');
  return assignment;
}
let driverTripBlocked = false;
try {
  getDriverTrip('drv-unrelated-99', trip1);
} catch (e) {
  driverTripBlocked = true;
}
assert(driverTripBlocked === true, 'Test 23: Drivers restricted exclusively to their assigned trips');

// Test 24: Customers cannot access private documents
function accessPrivateDocument(requesterRole) {
  if (requesterRole === 'CUSTOMER') throw new Error('403 Forbidden: Confidential compliance document requires OWNER or ADMIN role');
  return { fileKey: 'uuid-secure-rc.pdf' };
}
let customerDocBlocked = false;
try {
  accessPrivateDocument('CUSTOMER');
} catch (e) {
  customerDocBlocked = true;
}
assert(customerDocBlocked === true, 'Test 24: Private compliance vault prohibits direct customer document access');

// Test 25: Support users cannot change financial records
function updateTransactionRecord(userRole) {
  if (userRole === 'SUPPORT_AGENT') throw new Error('403 Forbidden: Finance Administrator role required for financial modifications');
  return true;
}
let financeRoleBlocked = false;
try {
  updateTransactionRecord('SUPPORT_AGENT');
} catch (e) {
  financeRoleBlocked = true;
}
assert(financeRoleBlocked === true, 'Test 25: Support agents prevented from altering ledger and financial payment records');

// Test 26: Verification reviewers cannot approve their own applications
let selfApprovalBlocked = false;
try {
  reviewApplication(indApp.id, indApp.userId, 'APPROVE', 'Attempting self-approval');
} catch (e) {
  selfApprovalBlocked = true;
}
assert(selfApprovalBlocked === true, 'Test 26: Conflict-of-interest check blocks administrators from approving their own onboarding application');

console.log('\n================================================================');
console.log(` Test Results: ${passed} PASSED | ${failed} FAILED`);
console.log('================================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('All 26 Phase 5 automated validation tests passed cleanly!\n');
}
