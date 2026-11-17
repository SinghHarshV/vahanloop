export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { assignDriverToBooking, updateDriverTripStatus } from '@/lib/driverManager';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const driverId = searchParams.get('driverId');
  const bookingId = searchParams.get('bookingId');

  let assignments = await db.driverTripAssignment.findMany();
  if (driverId) assignments = assignments.filter((a: any) => a.driverId === driverId);
  if (bookingId) assignments = assignments.filter((a: any) => a.bookingId === bookingId);

  // Enrich with booking & driver details
  const enriched = await Promise.all(
    assignments.map(async (a: any) => {
      const bk = await db.booking.findUnique({ where: { id: a.bookingId } });
      const drv = await db.extendedDriverProfile.findUnique({ where: { id: a.driverId } });
      return { ...a, booking: bk, driver: drv };
    })
  );

  return NextResponse.json({ assignments: enriched });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'ASSIGN') {
      const { bookingId, driverId, notes } = body;
      const res = await assignDriverToBooking({ bookingId, driverId, notes });
      if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, assignment: res.assignment });
    } else if (action === 'UPDATE_STATUS') {
      const { assignmentId, status, odometer, rejectionReason, notes } = body;
      const updated = await updateDriverTripStatus(assignmentId, status, { odometer, rejectionReason, notes });
      return NextResponse.json({ success: true, assignment: updated });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Driver assignment operation failed' }, { status: 500 });
  }
}
