import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { completeBookingHandover } from '@/lib/operationsManager';

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { bookingId, odometerReading, fuelLevelPercent, conditionRating = 'GOOD', notes, photos } = body;

    if (!bookingId || odometerReading === undefined || fuelLevelPercent === undefined) {
      return NextResponse.json({ error: 'Missing mandatory handover telemetry fields' }, { status: 400 });
    }

    const handover = await completeBookingHandover({
      bookingId,
      verifiedBy: user.id,
      odometerReading: Number(odometerReading),
      fuelLevelPercent: Number(fuelLevelPercent),
      conditionRating,
      notes,
      photos,
    });

    return NextResponse.json({ success: true, handover });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Handover failed' }, { status: 400 });
  }
}
