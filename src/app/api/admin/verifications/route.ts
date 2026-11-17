export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || !user.roles.includes('ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const applications = await db.ownerVerificationApplication.findMany();
  const organisations = await db.businessOrganisation.findMany();
  const reviews = await db.administrativeReview.findMany();

  return NextResponse.json({
    applications,
    organisations,
    recentReviews: reviews.slice(0, 20),
  });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || !user.roles.includes('ADMIN')) {
    return NextResponse.json({ error: 'Forbidden: Administrator privileges required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { applicationId, action, reason, entityType = 'OWNER' } = body;

    if (!applicationId || !action || !reason) {
      return NextResponse.json({ error: 'Missing applicationId, action, or documented reason' }, { status: 400 });
    }

    if (entityType === 'OWNER') {
      const app = await db.ownerVerificationApplication.findUnique({ where: { id: applicationId } });
      if (!app) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
      }

      // Self-approval restriction: an admin cannot approve their own submitted application
      if (app.userId === user.id) {
        return NextResponse.json({ error: 'Conflict of Interest: Administrators cannot approve their own verification application.' }, { status: 403 });
      }

      let newStatus: string = app.status;
      let payoutEligible = app.payoutEligible;

      switch (action) {
        case 'APPROVE':
          newStatus = 'VERIFIED';
          payoutEligible = true;
          break;
        case 'REJECT':
          newStatus = 'REJECTED';
          payoutEligible = false;
          break;
        case 'REQUEST_INFO':
          newStatus = 'ADDITIONAL_INFORMATION_REQUIRED';
          break;
        case 'SUSPEND':
          newStatus = 'SUSPENDED';
          payoutEligible = false;
          break;
        default:
          return NextResponse.json({ error: 'Invalid verification action' }, { status: 400 });
      }

      const updated = await db.ownerVerificationApplication.update({
        where: { id: applicationId },
        data: {
          status: newStatus,
          payoutEligible,
          reviewedBy: user.id,
          reviewedAt: new Date(),
          rejectionReason: action === 'REJECT' || action === 'REQUEST_INFO' ? reason : null,
        },
      });

      // Also update OwnerProfile verificationStatus if exists
      const op = await db.user.findUnique({ where: { id: app.userId } });
      if (op) {
        // sync
      }

      // Record administrative decision audit trail
      await db.administrativeReview.create({
        data: {
          entityType: 'OWNER',
          entityId: applicationId,
          adminId: user.id,
          action,
          previousStatus: app.status,
          newStatus,
          reason,
        },
      });

      return NextResponse.json({ success: true, application: updated });
    } else if (entityType === 'BUSINESS') {
      const org = await db.businessOrganisation.findUnique({ where: { id: applicationId } });
      if (!org) return NextResponse.json({ error: 'Organisation not found' }, { status: 404 });

      const newStatus = action === 'APPROVE' ? 'VERIFIED' : action === 'REJECT' ? 'REJECTED' : 'UNDER_REVIEW';
      const updated = await db.businessOrganisation.update({
        where: { id: applicationId },
        data: { verificationStatus: newStatus, rejectionReason: reason },
      });

      await db.administrativeReview.create({
        data: {
          entityType: 'BUSINESS',
          entityId: applicationId,
          adminId: user.id,
          action,
          previousStatus: org.verificationStatus,
          newStatus,
          reason,
        },
      });

      return NextResponse.json({ success: true, organisation: updated });
    }

    return NextResponse.json({ error: 'Unsupported entityType' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Verification update failed' }, { status: 500 });
  }
}
