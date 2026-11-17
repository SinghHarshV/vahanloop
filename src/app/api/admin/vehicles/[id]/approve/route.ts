export const dynamic = 'force-dynamic';
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

    const updated = await db.vehicle.update({
      where: { id: params.id },
      data: {
        approvalStatus: 'APPROVED',
        availabilityStatus: 'AVAILABLE',
        rejectionReason: null,
      },
    });

    await db.auditLog.create({
      data: {
        actorId: session.userId,
        action: 'VEHICLE_APPROVED',
        entityType: 'VEHICLE',
        entityId: vehicle.id,
        details: `Approved listing for ${vehicle.make} ${vehicle.model} by admin ${session.email}`,
      },
    });

    return NextResponse.json({
      message: 'Vehicle approved and published to customer search',
      vehicle: updated,
    });
  } catch (error: any) {
    console.error('Error approving vehicle:', error);
    return NextResponse.json({ error: 'Failed to approve vehicle' }, { status: 500 });
  }
}
