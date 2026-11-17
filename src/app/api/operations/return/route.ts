export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { completeBookingReturn } from '@/lib/operationsManager';

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { bookingId, odometerReading, fuelLevelPercent, conditionRating = 'GOOD', notes, photos, disputeRaised, disputeNotes } = body;

    if (!bookingId || odometerReading === undefined || fuelLevelPercent === undefined) {
      return NextResponse.json({ error: 'Missing mandatory return telemetry fields' }, { status: 400 });
    }

    const returnRecord = await completeBookingReturn({
      bookingId,
      verifiedBy: user.id,
      odometerReading: Number(odometerReading),
      fuelLevelPercent: Number(fuelLevelPercent),
      conditionRating,
      notes,
      photos,
      disputeRaised,
      disputeNotes,
    });

    return NextResponse.json({ success: true, returnRecord });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Return verification failed' }, { status: 400 });
  }
}
