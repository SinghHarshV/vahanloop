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

    return NextResponse.json({ bookings });
  } catch (error: any) {
    console.error('Owner bookings error:', error);
    return NextResponse.json({ error: 'Failed to fetch owner bookings' }, { status: 500 });
  }
}
