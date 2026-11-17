export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ message: 'Logged out successfully' });
  clearSessionCookie(response);
  return response;
}
