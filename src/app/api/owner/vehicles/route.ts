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

    const vehicles = await db.vehicle.findMany({
      where: { ownerId: session.userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ vehicles });
  } catch (error: any) {
    console.error('Owner vehicles error:', error);
    return NextResponse.json({ error: 'Failed to fetch owner vehicles' }, { status: 500 });
  }
}
