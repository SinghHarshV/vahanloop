export const dynamic = 'force-dynamic';
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

    const bookings = await db.booking.findMany({
      where: { vehicle: { ownerId: session.userId } },
      orderBy: { createdAt: 'desc' },
    });

    const settled = bookings.filter(
      (b: any) => b.status === 'CONFIRMED' || b.status === 'COMPLETED'
    );

    const grossRentalAmounts = settled.reduce((sum: number, b: any) => sum + b.totalAmount, 0);
    const platformCommission = Math.round(
      settled.reduce((sum: number, b: any) => sum + b.serviceFee, 0)
    );
    const ownerEarnings = grossRentalAmounts - platformCommission;

    return NextResponse.json({
      summary: {
        completedBookingsCount: settled.length,
        grossRentalAmounts,
        platformCommission,
        ownerEarnings,
      },
      settlements: settled.map((b: any) => ({
        id: b.id,
        vehicleTitle: `${b.vehicle?.make} ${b.vehicle?.model}`,
        customerName: b.customer?.fullName,
        pickupDate: b.pickupDateTime,
        returnDate: b.returnDateTime,
        grossAmount: b.totalAmount,
        commission: b.serviceFee,
        netPayout: b.totalAmount - b.serviceFee,
        status: b.status,
      })),
    });
  } catch (error: any) {
    console.error('Owner earnings error:', error);
    return NextResponse.json({ error: 'Failed to fetch owner earnings' }, { status: 500 });
  }
}
