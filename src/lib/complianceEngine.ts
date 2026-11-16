import { db } from './db';

export interface ComplianceEvaluationInput {
  vehicleId: string;
  rentalModel: 'SELF_DRIVE' | 'CHAUFFEUR';
  jurisdictionState?: string;
  jurisdictionCity?: string;
  driverId?: string;
}

export interface ComplianceEvaluationResult {
  isLegallyPermitted: boolean;
  bookingEligible: boolean;
  matchedRuleId: string | null;
  ruleReference: string | null;
  breakdown: {
    ownerVerification: { status: 'PASS' | 'FAIL' | 'PENDING'; message: string };
    vehicleDocuments: { status: 'PASS' | 'FAIL' | 'PENDING'; missing: string[]; expired: string[] };
    permitVerification: { status: 'PASS' | 'FAIL' | 'PENDING'; required: string[]; message: string };
    insuranceCoverage: { status: 'PASS' | 'FAIL' | 'PENDING'; message: string };
    driverQualification?: { status: 'PASS' | 'FAIL' | 'PENDING'; message: string };
    internalListingApproval: { status: 'PASS' | 'FAIL' | 'PENDING'; message: string };
  };
  violations: string[];
  disclaimer: string;
}

/**
 * VahanLoop Configurable Compliance & Vehicle Eligibility Engine.
 * Evaluates Indian transport regulations, state schemes (e.g. Rent a Cab 1989, Rent a Motorcycle 1997),
 * permit validity, and driver credentials for a specific vehicle and rental arrangement.
 */
export async function evaluateCompliance(input: ComplianceEvaluationInput): Promise<ComplianceEvaluationResult> {
  const vehicle = await db.vehicle.findUnique({ where: { id: input.vehicleId } });
  if (!vehicle) {
    return {
      isLegallyPermitted: false,
      bookingEligible: false,
      matchedRuleId: null,
      ruleReference: null,
      breakdown: {
        ownerVerification: { status: 'FAIL', message: 'Vehicle not found' },
        vehicleDocuments: { status: 'FAIL', missing: [], expired: [] },
        permitVerification: { status: 'FAIL', required: [], message: 'Vehicle not found' },
        insuranceCoverage: { status: 'FAIL', message: 'Vehicle not found' },
        internalListingApproval: { status: 'FAIL', message: 'Vehicle not found' },
      },
      violations: ['Vehicle does not exist in platform catalogue.'],
      disclaimer: 'Administrative compliance evaluation only. Does not replace government RTO certification.',
    };
  }

  const owner = vehicle.owner;
  const state = (input.jurisdictionState || 'KARNATAKA').toUpperCase();
  const category = (vehicle.category || 'CAR').toUpperCase();
  const rentalModel = input.rentalModel;

  // 1. Fetch matching compliance rule from database
  const rules = await db.complianceRule.findMany({
    where: {
      jurisdictionState: state,
      vehicleCategory: category,
      rentalModel: rentalModel,
      status: 'ACTIVE',
    },
  });

  const activeRule = rules[0] || null;
  const violations: string[] = [];

  // 2. Owner Onboarding & Verification check
  let ownerStatus: 'PASS' | 'FAIL' | 'PENDING' = 'FAIL';
  let ownerMsg = 'Owner verification is incomplete.';

  const ownerApp = await db.ownerVerificationApplication.findUnique({
    where: { userId: vehicle.ownerId },
  });

  if (ownerApp && ownerApp.status === 'VERIFIED') {
    ownerStatus = 'PASS';
    ownerMsg = 'Owner identity and bank payout credentials verified.';
  } else if (owner && owner.accountStatus === 'ACTIVE') {
    // Basic account fallback
    ownerStatus = 'PASS';
    ownerMsg = 'Owner registered and active on platform.';
  } else {
    violations.push('Host has not completed verified onboarding & compliance terms.');
  }

  // 3. Document Requirements Evaluation
  const requiredDocTypes = activeRule
    ? activeRule.requiredDocuments.split(',').map((s: string) => s.trim().toUpperCase())
    : ['RC', 'INSURANCE', 'PUC'];

  const vehicleDocs = vehicle.documents || [];
  const missingDocs: string[] = [];
  const expiredDocs: string[] = [];
  const now = new Date();

  for (const reqDoc of requiredDocTypes) {
    const found = vehicleDocs.find((d: any) => (d.documentType || d.category || '').toUpperCase() === reqDoc);
    if (!found) {
      missingDocs.push(reqDoc);
    } else {
      if (found.verificationStatus !== 'VERIFIED' && found.status !== 'APPROVED') {
        missingDocs.push(`${reqDoc} (Awaiting Verification)`);
      }
      if (found.expiryDate && new Date(found.expiryDate).getTime() < now.getTime()) {
        expiredDocs.push(`${reqDoc} (Expired on ${new Date(found.expiryDate).toLocaleDateString()})`);
      }
    }
  }

  if (missingDocs.length > 0) {
    violations.push(`Mandatory compliance documents missing: ${missingDocs.join(', ')}.`);
  }
  if (expiredDocs.length > 0) {
    violations.push(`Expired compliance documents: ${expiredDocs.join(', ')}.`);
  }

  const docStatus: 'PASS' | 'FAIL' | 'PENDING' = (missingDocs.length === 0 && expiredDocs.length === 0) ? 'PASS' : 'FAIL';

  // 4. Permit Verification
  let permitStatus: 'PASS' | 'FAIL' | 'PENDING' = 'PASS';
  const requiredPermits = activeRule?.requiredPermits
    ? activeRule.requiredPermits.split(',').map((s: string) => s.trim().toUpperCase())
    : [];

  let permitMsg = 'No special commercial permit required under pilot jurisdiction guidelines.';
  if (requiredPermits.length > 0) {
    const hasPermit = vehicleDocs.some((d: any) =>
      requiredPermits.includes((d.documentType || d.category || '').toUpperCase()) &&
      (d.verificationStatus === 'VERIFIED' || d.status === 'APPROVED')
    );
    if (!hasPermit) {
      permitStatus = 'PENDING';
      permitMsg = `Required scheme authorization missing: ${requiredPermits.join(', ')}.`;
      violations.push(`Required transport scheme permit missing: ${requiredPermits.join(', ')}.`);
    } else {
      permitMsg = `Permit verified: ${requiredPermits.join(', ')}.`;
    }
  }

  // 5. Insurance Coverage
  const insuranceDoc = vehicleDocs.find((d: any) => (d.documentType || d.category || '').toUpperCase() === 'INSURANCE');
  let insuranceStatus: 'PASS' | 'FAIL' | 'PENDING' = 'FAIL';
  let insuranceMsg = 'Comprehensive rental insurance coverage unverified.';
  if (insuranceDoc && (insuranceDoc.verificationStatus === 'VERIFIED' || insuranceDoc.status === 'APPROVED')) {
    if (!insuranceDoc.expiryDate || new Date(insuranceDoc.expiryDate).getTime() > now.getTime()) {
      insuranceStatus = 'PASS';
      insuranceMsg = 'Active commercial/rental policy verified on record.';
    } else {
      insuranceMsg = 'Insurance policy has expired.';
      violations.push('Insurance policy expired. Rentals strictly prohibited.');
    }
  } else {
    violations.push('Valid insurance certificate not verified.');
  }

  // 6. Chauffeur & Driver Qualification (if CHAUFFEUR)
  let driverBreakdown: { status: 'PASS' | 'FAIL' | 'PENDING'; message: string } | undefined = undefined;
  if (rentalModel === 'CHAUFFEUR') {
    if (!input.driverId) {
      driverBreakdown = {
        status: 'PENDING',
        message: 'Chauffeur rental selected; qualified commercial driver assignment pending.',
      };
      violations.push('Driver not yet assigned to chauffeur booking.');
    } else {
      const driver = await db.extendedDriverProfile.findUnique({ where: { id: input.driverId } });
      if (!driver) {
        driverBreakdown = { status: 'FAIL', message: 'Assigned driver profile not found.' };
        violations.push('Assigned driver profile does not exist.');
      } else if (driver.licenceVerificationStatus !== 'VERIFIED') {
        driverBreakdown = { status: 'FAIL', message: 'Driver commercial licence not verified.' };
        violations.push('Assigned driver licence verification is incomplete.');
      } else if (driver.availabilityStatus === 'UNAVAILABLE' || driver.availabilityStatus === 'OFF_DUTY') {
        driverBreakdown = { status: 'FAIL', message: `Driver status is ${driver.availabilityStatus}.` };
        violations.push('Assigned driver is not currently available for duty.');
      } else {
        driverBreakdown = { status: 'PASS', message: `Verified driver: ${driver.fullName} (${driver.licenceCategory}).` };
      }
    }
  }

  // 7. Internal Listing Approval
  const isApproved = (vehicle.approvalStatus as string).toUpperCase() === 'APPROVED';
  const internalListingApproval = {
    status: isApproved ? ('PASS' as const) : ('PENDING' as const),
    message: isApproved ? 'Vehicle listing approved by platform admin.' : 'Listing pending administrative review.',
  };
  if (!isApproved) {
    violations.push('Vehicle listing has not yet received platform administrator approval.');
  }

  // Final evaluation
  const isLegallyPermitted: boolean = Boolean(
    ownerStatus === 'PASS' &&
    docStatus === 'PASS' &&
    permitStatus === 'PASS' &&
    insuranceStatus === 'PASS' &&
    (rentalModel !== 'CHAUFFEUR' || (driverBreakdown && driverBreakdown.status === 'PASS'))
  );

  const bookingEligible: boolean = Boolean(
    isLegallyPermitted && isApproved && vehicle.availabilityStatus === 'AVAILABLE'
  );

  return {
    isLegallyPermitted,
    bookingEligible,
    matchedRuleId: activeRule?.ruleId || 'DEFAULT-MV-ACT-1988',
    ruleReference: activeRule?.sourceReference || 'Motor Vehicles Act 1988 / Central Motor Vehicles Rules 1989',
    breakdown: {
      ownerVerification: { status: ownerStatus, message: ownerMsg },
      vehicleDocuments: { status: docStatus, missing: missingDocs, expired: expiredDocs },
      permitVerification: { status: permitStatus, required: requiredPermits, message: permitMsg },
      insuranceCoverage: { status: insuranceStatus, message: insuranceMsg },
      driverQualification: driverBreakdown,
      internalListingApproval,
    },
    violations,
    disclaimer: 'Notice: This evaluation is generated by VahanLoop’s internal compliance rules engine. It is not a government certificate.',
  };
}
