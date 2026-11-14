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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let bookings = await db.booking.findMany({ orderBy: { createdAt: 'desc' } });
    if (status && status !== 'all') {
      bookings = bookings.filter((b: any) => b.status === status.toUpperCase());
    }

    return NextResponse.json({ bookings });
  } catch (error: any) {
    console.error('Admin bookings error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin bookings' }, { status: 500 });
  }
}
