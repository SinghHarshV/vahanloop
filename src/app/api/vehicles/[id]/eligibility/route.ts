import { NextRequest, NextResponse } from 'next/server';
import { checkVehicleEligibility } from '@/lib/vehicleEligibility';
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

    const result = await checkVehicleEligibility(params.id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Eligibility check error:', error);
    return NextResponse.json({ error: 'Failed to evaluate vehicle eligibility' }, { status: 500 });
  }
}
