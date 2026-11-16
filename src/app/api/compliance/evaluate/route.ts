import { NextRequest, NextResponse } from 'next/server';
import { evaluateCompliance } from '@/lib/complianceEngine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vehicleId, rentalModel = 'SELF_DRIVE', jurisdictionState, jurisdictionCity, driverId } = body;

    if (!vehicleId) {
      return NextResponse.json({ error: 'vehicleId is required' }, { status: 400 });
    }

    const evaluation = await evaluateCompliance({
      vehicleId,
      rentalModel,
      jurisdictionState,
      jurisdictionCity,
      driverId,
    });

    return NextResponse.json({ success: true, evaluation });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Compliance evaluation failed' }, { status: 500 });
  }
}
