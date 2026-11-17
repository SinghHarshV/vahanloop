export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

interface RouteContext {
  params: { id: string };
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const booking = await db.booking.findUnique({ where: { id: params.id } });
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const isCustomer = session.userId === booking.customerId;
    const isOwner = session.userId === booking.vehicle?.ownerId;
    const isAdmin = session.roles.includes('ADMIN');

    if (!isCustomer && !isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to view this booking' },
        { status: 403 }
      );
    }

    return NextResponse.json({ booking });
  } catch (error: any) {
    console.error('Error fetching booking:', error);
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}
