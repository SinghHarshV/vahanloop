export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const app = await db.ownerVerificationApplication.findUnique({
    where: { userId: user.id },
  });

  return NextResponse.json({ application: app || null });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      ownerType = 'INDIVIDUAL',
      currentStep = 1,
      fullName,
      email,
      mobile,
      address,
      idVerificationMethod,
      idVerificationRef,
      bankAccountHolder,
      bankVerificationStatus = 'PENDING',
      bankVerificationRef,
      payoutEligible = false,
      termsAccepted = false,
      termsVersion = 'v1.2',
      isFinalSubmission = false,
    } = body;

    const existing = await db.ownerVerificationApplication.findUnique({
      where: { userId: user.id },
    });

    const newStatus = isFinalSubmission ? 'SUBMITTED' : (existing?.status || 'IN_PROGRESS');

    let result;
    if (existing) {
      result = await db.ownerVerificationApplication.update({
        where: { userId: user.id },
        data: {
          ownerType,
          currentStep,
          status: newStatus,
          fullName: fullName || existing.fullName,
          email: email || existing.email,
          mobile: mobile || existing.mobile,
          address: address !== undefined ? address : existing.address,
          idVerificationMethod: idVerificationMethod || existing.idVerificationMethod,
          idVerificationRef: idVerificationRef || existing.idVerificationRef,
          bankAccountHolder: bankAccountHolder || existing.bankAccountHolder,
          bankVerificationStatus,
          bankVerificationRef: bankVerificationRef || existing.bankVerificationRef,
          payoutEligible,
          termsAccepted,
          termsVersion,
          termsAcceptedAt: termsAccepted ? new Date() : existing.termsAcceptedAt,
          submittedAt: isFinalSubmission ? new Date() : existing.submittedAt,
        },
      });
    } else {
      result = await db.ownerVerificationApplication.create({
        data: {
          userId: user.id,
          ownerType,
          currentStep,
          status: newStatus,
          fullName: fullName || user.fullName,
          email: email || user.email,
          mobile: mobile || user.phone,
          address: address || null,
          idVerificationMethod: idVerificationMethod || null,
          idVerificationRef: idVerificationRef || null,
          bankAccountHolder: bankAccountHolder || null,
          bankVerificationStatus,
          bankVerificationRef: bankVerificationRef || null,
          payoutEligible,
          termsAccepted,
          termsVersion,
          termsAcceptedAt: termsAccepted ? new Date() : null,
          submittedAt: isFinalSubmission ? new Date() : null,
        },
      });
    }

    // Record audit log
    await db.auditLog.create({
      data: {
        actorId: user.id,
        action: isFinalSubmission ? 'OWNER_ONBOARDING_SUBMITTED' : 'OWNER_ONBOARDING_SAVED',
        entityType: 'OWNER_APPLICATION',
        entityId: result.id,
        details: `Step: ${currentStep}, Status: ${newStatus}, Type: ${ownerType}`,
      },
    });

    return NextResponse.json({ success: true, application: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save application' }, { status: 500 });
  }
}
