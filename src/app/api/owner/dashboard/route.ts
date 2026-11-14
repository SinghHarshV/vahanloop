import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || (!session.roles.includes('OWNER') && !session.roles.includes('ADMIN'))) {
      return NextResponse.json(
        { error: 'Forbidden: Vehicle partner access required' },
        { status: 403 }
      );
    }

    const vehicles = await db.vehicle.findMany({ where: { ownerId: session.userId } });
    const activeVehicles = vehicles.filter(
      (v: any) => v.approvalStatus === 'APPROVED' && v.availabilityStatus === 'AVAILABLE'
    );
    const pendingVehicles = vehicles.filter((v: any) => v.approvalStatus === 'PENDING');

    const bookings = await db.booking.findMany({
      where: { vehicle: { ownerId: session.userId } },
      orderBy: { createdAt: 'desc' },
    });

    const pendingRequests = bookings.filter((b: any) => b.status === 'REQUESTED');
    const confirmedBookings = bookings.filter(
      (b: any) => b.status === 'CONFIRMED' || b.status === 'COMPLETED'
    );

    const grossEarnings = confirmedBookings.reduce((sum: number, b: any) => sum + b.totalAmount, 0);
    const platformCommission = Math.round(
      confirmedBookings.reduce((sum: number, b: any) => sum + b.serviceFee, 0)
    );
    const netEarnings = grossEarnings - platformCommission;

    return NextResponse.json({
      metrics: {
        totalVehicles: vehicles.length,
        activeListings: activeVehicles.length,
        pendingApproval: pendingVehicles.length,
        totalBookings: bookings.length,
        grossEarnings,
        platformCommission,
        netEarnings,
      },
      recentRequests: pendingRequests.slice(0, 5),
    });
  } catch (error: any) {
    console.error('Owner dashboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch owner dashboard' }, { status: 500 });
  }
}
