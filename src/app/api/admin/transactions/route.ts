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

    const payments = await db.payment.findMany();
    return NextResponse.json({ transactions: payments });
  } catch (error: any) {
    console.error('Admin transactions error:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}
