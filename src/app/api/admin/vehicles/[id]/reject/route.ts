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
      return NextResponse.json(
        { error: 'Forbidden: Platform Administrator access required' },
        { status: 403 }
      );
    }

    const vehicle = await db.vehicle.findUnique({ where: { id: params.id } });
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const reason = body.reason || 'Verification standards not met';

    const updated = await db.vehicle.update({
      where: { id: params.id },
      data: {
        approvalStatus: 'REJECTED',
        rejectionReason: reason,
      },
    });

    await db.auditLog.create({
      data: {
        actorId: session.userId,
        action: 'VEHICLE_REJECTED',
        entityType: 'VEHICLE',
        entityId: vehicle.id,
        details: `Rejected listing for ${vehicle.make} ${vehicle.model}: ${reason}`,
      },
    });

    return NextResponse.json({
      message: 'Vehicle listing rejected',
      vehicle: updated,
    });
  } catch (error: any) {
    console.error('Error rejecting vehicle:', error);
    return NextResponse.json({ error: 'Failed to reject vehicle' }, { status: 500 });
  }
}
