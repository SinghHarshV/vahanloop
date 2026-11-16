import { db } from './db';

export interface EligibilityResult {
  isEligible: boolean;
  canPublish: boolean;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  reasons: string[];
  checklist: {
    ownerVerified: boolean;
    hasApprovedRC: boolean;
    hasApprovedInsurance: boolean;
    hasApprovedPUC: boolean;
    documentsNotExpired: boolean;
    adminListingApproved: boolean;
  };
}

/**
 * Validates a vehicle's eligibility to be published and rented on VahanLoop.
 * A vehicle must NEVER become bookable merely because an admin clicked Approve on the basic listing.
 */
export async function checkVehicleEligibility(vehicleId: string): Promise<EligibilityResult> {
  const vehicle = await db.vehicle.findUnique({
    where: { id: vehicleId },
  });

  if (!vehicle) {
    return {
      isEligible: false,
      canPublish: false,
      status: 'REJECTED',
      reasons: ['Vehicle not found.'],
      checklist: {
        ownerVerified: false,
        hasApprovedRC: false,
        hasApprovedInsurance: false,
        hasApprovedPUC: false,
        documentsNotExpired: false,
        adminListingApproved: false,
      },
    };
  }

  const reasons: string[] = [];

  // 1. Owner verification check
  const owner = vehicle.owner;
  const ownerVerified = Boolean(
    owner && (owner.accountStatus === 'ACTIVE' || owner.ownerProfile?.verificationStatus === 'VERIFIED')
  );
  if (!ownerVerified) {
    reasons.push('Vehicle owner account is not verified.');
  }

  // 2. Document verification checks
  // Check documents from both VehicleDocument and VehicleDocumentVersion
  const docs = vehicle.documents || [];
  const versions = vehicle.documentVersions || [];

  const rcApproved = docs.some((d: any) => (d.documentType === 'RC' || d.category === 'RC') && (d.verificationStatus === 'VERIFIED' || d.status === 'APPROVED')) ||
    versions.some((v: any) => v.category === 'RC' && v.status === 'APPROVED');

  const insuranceApproved = docs.some((d: any) => (d.documentType === 'INSURANCE' || d.category === 'INSURANCE') && (d.verificationStatus === 'VERIFIED' || d.status === 'APPROVED')) ||
    versions.some((v: any) => v.category === 'INSURANCE' && v.status === 'APPROVED');

  const pucApproved = docs.some((d: any) => (d.documentType === 'PUC' || d.category === 'PUC') && (d.verificationStatus === 'VERIFIED' || d.status === 'APPROVED')) ||
    versions.some((v: any) => v.category === 'PUC' && v.status === 'APPROVED');

  if (!rcApproved) reasons.push('Approved Registration Certificate (RC) is required.');
  if (!insuranceApproved) reasons.push('Approved Vehicle Insurance Certificate is required.');

  // 3. Document Expiry Check
  const now = new Date();
  let documentsNotExpired = true;
  for (const d of docs) {
    if (d.expiryDate && new Date(d.expiryDate).getTime() < now.getTime()) {
      documentsNotExpired = false;
      reasons.push(`Document ${d.documentType || d.category} expired on ${new Date(d.expiryDate).toLocaleDateString()}.`);
    }
  }

  // 4. Admin Listing Approval
  const adminListingApproved = vehicle.approvalStatus === 'APPROVED' || (vehicle.approvalStatus as string).toLowerCase() === 'approved';
  if (!adminListingApproved) {
    reasons.push('Vehicle listing has not yet received administrator review approval.');
  }

  const checklist = {
    ownerVerified,
    hasApprovedRC: rcApproved,
    hasApprovedInsurance: insuranceApproved,
    hasApprovedPUC: pucApproved,
    documentsNotExpired,
    adminListingApproved,
  };

  const isEligible = ownerVerified && rcApproved && insuranceApproved && documentsNotExpired && adminListingApproved;

  return {
    isEligible,
    canPublish: isEligible && vehicle.availabilityStatus === 'AVAILABLE',
    status: isEligible ? 'APPROVED' : (vehicle.approvalStatus === 'PENDING' ? 'PENDING_REVIEW' : 'REJECTED'),
    reasons,
    checklist,
  };
}
