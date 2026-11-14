import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || !session.roles.includes('ADMIN')) {
      return NextResponse.json(
        { error: 'Forbidden: Platform Administrator access required' },
        { status: 403 }
      );
    }

    const users = await db.user.findMany();
    const vehicles = await db.vehicle.findMany();
    const bookings = await db.booking.findMany();
    const auditLogs = await db.auditLog.findMany();

    const approvedListings = vehicles.filter((v: any) => v.approvalStatus === 'APPROVED').length;
    const pendingListings = vehicles.filter((v: any) => v.approvalStatus === 'PENDING').length;
    const grossBookingValue = bookings.reduce((sum: number, b: any) => sum + b.totalAmount, 0);

    return NextResponse.json({
      metrics: {
        totalUsers: users.length,
        totalVehicles: vehicles.length,
        approvedListings,
        pendingListings,
        totalBookings: bookings.length,
        grossBookingValue,
      },
      recentLogs: auditLogs.slice(0, 10),
    });
  } catch (error: any) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin dashboard' }, { status: 500 });
  }
}
