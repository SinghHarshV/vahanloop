import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !session.roles.includes('ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    db.resetStore();
    return NextResponse.json({ success: true, message: 'Demo data restored to factory defaults.' });
  } catch (err) {
    console.error('Reset error:', err);
    return NextResponse.json({ error: 'Reset failed' }, { status: 500 });
  }
}
