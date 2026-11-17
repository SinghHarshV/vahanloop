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

    const users = await db.user.findMany({ orderBy: { createdAt: 'desc' } });
    const safeUsers = users.map((u: any) => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      accountStatus: u.accountStatus,
      roles: (u.roles || []).map((r: any) => r.role),
      createdAt: u.createdAt,
    }));

    return NextResponse.json({ users: safeUsers });
  } catch (error: any) {
    console.error('Admin users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
