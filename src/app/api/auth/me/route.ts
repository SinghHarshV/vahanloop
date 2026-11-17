export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getSession(req);

  if (!session) {
    return NextResponse.json({ user: null });
  }

  const user = await db.user.findUnique({ where: { id: session.userId } });

  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      roles: (user.roles || []).map((r: any) => r.role),
      ownerProfile: user.ownerProfile,
    },
  });
}
