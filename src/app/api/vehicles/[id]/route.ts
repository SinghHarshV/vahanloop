import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { vehicleUpdateSchema } from '@/lib/validations';

interface RouteContext {
  params: { id: string };
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const vehicle = await db.vehicle.findUnique({ where: { id: params.id } });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // If vehicle is not approved, only owner or admin can view details
    if (vehicle.approvalStatus !== 'APPROVED') {
      const session = await getSession(req);
      const isOwner = session && session.userId === vehicle.ownerId;
      const isAdmin = session && session.roles.includes('ADMIN');

      if (!isOwner && !isAdmin) {
        return NextResponse.json(
          { error: 'This vehicle is currently undergoing administrator verification' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ vehicle });
  } catch (error: any) {
    console.error('Error fetching vehicle by id:', error);
    return NextResponse.json({ error: 'Failed to fetch vehicle' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const vehicle = await db.vehicle.findUnique({ where: { id: params.id } });
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // RBAC: An owner must not access/modify another owner's vehicle
    const isOwner = session.userId === vehicle.ownerId;
    const isAdmin = session.roles.includes('ADMIN');

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to edit this vehicle' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = vehicleUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation error', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await db.vehicle.update({
      where: { id: params.id },
      data: parsed.data,
    });

    await db.auditLog.create({
      data: {
        actorId: session.userId,
        action: 'VEHICLE_UPDATED',
        entityType: 'VEHICLE',
        entityId: vehicle.id,
        details: `Updated vehicle properties by ${isAdmin ? 'admin' : 'owner'}`,
      },
    });

    return NextResponse.json({ message: 'Vehicle updated successfully', vehicle: updated });
  } catch (error: any) {
    console.error('Error updating vehicle:', error);
    return NextResponse.json({ error: 'Failed to update vehicle' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const vehicle = await db.vehicle.findUnique({ where: { id: params.id } });
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    const isOwner = session.userId === vehicle.ownerId;
    const isAdmin = session.roles.includes('ADMIN');

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to delete this vehicle' },
        { status: 403 }
      );
    }

    await db.vehicle.update({
      where: { id: params.id },
      data: { availabilityStatus: 'INACTIVE' },
    });

    await db.auditLog.create({
      data: {
        actorId: session.userId,
        action: 'VEHICLE_DEACTIVATED',
        entityType: 'VEHICLE',
        entityId: vehicle.id,
        details: 'Vehicle deactivated / deleted',
      },
    });

    return NextResponse.json({ message: 'Vehicle deactivated successfully' });
  } catch (error: any) {
    console.error('Error deleting vehicle:', error);
    return NextResponse.json({ error: 'Failed to deactivate vehicle' }, { status: 500 });
  }
}
