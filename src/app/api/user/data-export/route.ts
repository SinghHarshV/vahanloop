export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

/**
 * DPDP / GDPR Data Portability: User Data Export
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required for data export' }, { status: 401 });
    }

    const userData = await db.user.findUnique({
      where: { id: user.id },
      include: {
        roles: true,
        ownerProfile: true,
        driverProfile: true,
      },
    });

    const userBookings = await db.booking.findMany({
      where: { customerId: user.id },
      include: { payments: true },
    });

    const userVehicles = user.roles.includes('OWNER')
      ? await db.vehicle.findMany({ where: { ownerId: user.id } })
      : [];

    const exportBundle = {
      exportedAt: new Date().toISOString(),
      regulations: 'Indian DPDP Act 2023 & IT Act Section 43A Compliant Data Bundle',
      profile: {
        id: userData?.id,
        fullName: userData?.fullName,
        email: userData?.email,
        phone: userData?.phone,
        accountStatus: userData?.accountStatus,
        createdAt: userData?.createdAt,
      },
      bookings: userBookings,
      vehicles: userVehicles,
      notice: 'This export contains all personal and transactional records associated with your VahanLoop ID.',
    };

    return new NextResponse(JSON.stringify(exportBundle, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="vahanloop-data-export-${user.id}.json"`,
      },
    });
  } catch (error: any) {
    console.error('Data export error:', error);
    return NextResponse.json({ error: 'Failed to generate data export' }, { status: 500 });
  }
}

/**
 * DPDP Right to Erasure / Account Deletion Request
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const reason = body.reason || 'User requested account closure';

    await db.auditLog.create({
      data: {
        actorId: user.id,
        action: 'DATA_ERASURE_REQUESTED',
        entityType: 'USER',
        entityId: user.id,
        details: `Account anonymization requested. Reason: ${reason}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Your account closure and data anonymization request has been submitted to the Privacy Desk.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to process deletion request' }, { status: 500 });
  }
}
