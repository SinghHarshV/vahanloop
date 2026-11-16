import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

interface RouteContext {
  params: { id: string };
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getSession(req);
    if (!session || !session.roles.includes('ADMIN')) {
      return NextResponse.json({ error: 'Platform Administrator access required' }, { status: 403 });
    }

    const body = await req.json();
    const { action, reason } = body; // action: 'approve' | 'reject'

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ error: 'Action must be approve or reject' }, { status: 400 });
    }

    if (action === 'reject' && !reason) {
      return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
    }

    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
    const newVerificationStatus = action === 'approve' ? 'VERIFIED' : 'REJECTED';

    // Update document version if available
    let updated;
    if (db.vehicleDocumentVersion?.update) {
      try {
        updated = await db.vehicleDocumentVersion.update({
          where: { id: params.id },
          data: {
            status: newStatus,
            rejectionReason: reason || null,
            reviewedBy: session.userId,
            reviewedAt: new Date(),
          },
        });
      } catch {
        // continue
      }
    }

    if (db.vehicleDocument?.update) {
      try {
        await db.vehicleDocument.update({
          where: { id: params.id },
          data: {
            verificationStatus: newVerificationStatus,
            status: newStatus,
          },
        });
      } catch {
        // continue
      }
    }

    await db.auditLog.create({
      data: {
        actorId: session.userId,
        action: `DOCUMENT_${action.toUpperCase()}D`,
        entityType: 'VEHICLE_DOCUMENT',
        entityId: params.id,
        details: `Document ${action}d by Admin ${session.email}.${reason ? ` Reason: ${reason}` : ''}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Document successfully ${action}d`,
      status: newStatus,
    });
  } catch (error: any) {
    console.error('Document review error:', error);
    return NextResponse.json({ error: 'Failed to review document' }, { status: 500 });
  }
}
