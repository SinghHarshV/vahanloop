export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, signSession, setSessionCookie, UserRoleType } from '@/lib/auth';
import { registerSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { fullName, email, phone, password, role, ownerType, businessName } = parsed.data;

    // Check duplicate email
    const existingEmail = await db.user.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json(
        { error: 'An account with this email address already exists.' },
        { status: 400 }
      );
    }

    // Check duplicate phone
    const existingPhone = await db.user.findUnique({ where: { phone } });
    if (existingPhone) {
      return NextResponse.json(
        { error: 'An account with this phone number already exists.' },
        { status: 400 }
      );
    }

    // Prevent normal users from registering as ADMIN
    const requestedRole: UserRoleType = role === 'OWNER' ? 'OWNER' : 'CUSTOMER';
    const passwordHash = await hashPassword(password);

    const rolesToCreate = [{ role: requestedRole }];
    if (requestedRole === 'OWNER') {
      rolesToCreate.push({ role: 'CUSTOMER' }); // Owners can also rent
    }

    const user = await db.user.create({
      data: {
        fullName,
        email: email.toLowerCase(),
        phone,
        passwordHash,
        accountStatus: 'ACTIVE',
        roles: {
          create: rolesToCreate,
        },
        ...(requestedRole === 'OWNER'
          ? {
              ownerProfile: {
                create: {
                  ownerType: ownerType || 'INDIVIDUAL',
                  businessName: businessName || null,
                  verificationStatus: 'VERIFIED',
                },
              },
            }
          : {}),
      },
    });

    const userRoles = (user.roles || []).map((r: any) => r.role as UserRoleType);

    const sessionToken = await signSession({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      roles: userRoles,
      ownerProfileId: user.ownerProfile?.id,
    });

    await db.auditLog.create({
      data: {
        actorId: user.id,
        action: 'USER_REGISTERED',
        entityType: 'USER',
        entityId: user.id,
        details: `Registered as ${requestedRole}`,
      },
    });

    const response = NextResponse.json(
      {
        message: 'Registration successful',
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          roles: userRoles,
          ownerProfile: user.ownerProfile,
        },
      },
      { status: 201 }
    );

    setSessionCookie(response, sessionToken);
    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error during registration' },
      { status: 500 }
    );
  }
}
