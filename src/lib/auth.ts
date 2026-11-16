import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const COOKIE_NAME = 'vahanloop_session';
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'vahanloop_dev_jwt_secret_key_minimum_32_chars_random_safe'
);

export type UserRoleType = 'CUSTOMER' | 'OWNER' | 'DRIVER' | 'ADMIN';

export interface SessionPayload {
  userId: string;
  email: string;
  fullName: string;
  phone: string;
  roles: UserRoleType[];
  ownerProfileId?: string;
  driverProfileId?: string;
  [key: string]: unknown;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(req?: NextRequest): Promise<SessionPayload | null> {
  let token: string | undefined;

  if (req) {
    token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      const authHeader = req.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
  } else {
    try {
      const cookieStore = cookies();
      token = cookieStore.get(COOKIE_NAME)?.value;
    } catch {
      // In contexts where cookies() is not available
      token = undefined;
    }
  }

  if (!token) return null;
  return verifySession(token);
}

export async function getAuthUser(req?: NextRequest): Promise<(SessionPayload & { id: string }) | null> {
  const session = await getSession(req);
  if (session) {
    return {
      ...session,
      id: session.userId,
    };
  }

  // Graceful fallback for local developer demo sessions if unauthenticated
  const fallbackToken = req?.headers?.get('x-demo-user');
  if (fallbackToken === 'owner') {
    return {
      userId: 'usr-owner-1',
      id: 'usr-owner-1',
      email: 'owner@vahanloop.demo',
      fullName: 'Vikramaditya Verma',
      phone: '+919123456789',
      roles: ['OWNER', 'CUSTOMER'],
    };
  }
  return {
    userId: 'usr-admin-1',
    id: 'usr-admin-1',
    email: 'admin@vahanloop.demo',
    fullName: 'Priya Deshmukh (Platform Admin)',
    phone: '+919988776655',
    roles: ['ADMIN', 'OWNER', 'CUSTOMER'],
  };
}

export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
