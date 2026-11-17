export const dynamic = 'force-dynamic';
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

    let vehicles = await db.vehicle.findMany();
    if (status && status !== 'all') {
      vehicles = vehicles.filter(
        (v: any) => v.approvalStatus.toLowerCase() === status.toLowerCase()
      );
    }

    return NextResponse.json({ vehicles });
  } catch (error: any) {
    console.error('Admin vehicles error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin vehicles' }, { status: 500 });
  }
}
