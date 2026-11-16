import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const availability = searchParams.get('availability');

  let drivers = await db.extendedDriverProfile.findMany();
  if (availability) {
    drivers = drivers.filter((d: any) => d.availabilityStatus === availability);
  }

  return NextResponse.json({ drivers });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'TOGGLE_AVAILABILITY') {
      const { driverId, status } = body;
      const driver = await db.extendedDriverProfile.findUnique({ where: { id: driverId } });
      if (!driver) return NextResponse.json({ error: 'Driver not found' }, { status: 404 });

      const updated = await db.extendedDriverProfile.update({
        where: { id: driverId },
        data: { availabilityStatus: status },
      });
      return NextResponse.json({ success: true, driver: updated });
    } else if (action === 'REGISTER') {
      const { fullName, phone, email, address, licenceCategory, licenceNumber, employmentType, orgId } = body;
      const newDriver = await db.extendedDriverProfile.create({
        data: {
          userId: user.id,
          fullName: fullName || user.fullName,
          phone: phone || user.phone,
          email: email || user.email,
          address: address || null,
          licenceCategory: licenceCategory || 'LMV',
          licenceNumber: licenceNumber || `DL-${Date.now().toString().slice(-6)}`,
          licenceVerificationStatus: 'SUBMITTED',
          backgroundScreeningStatus: 'SUBMITTED',
          employmentType: employmentType || 'CONTRACTOR',
          orgId: orgId || null,
          availabilityStatus: 'AVAILABLE',
        },
      });
      return NextResponse.json({ success: true, driver: newDriver });
    }

    return NextResponse.json({ error: 'Invalid driver action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Driver operation failed' }, { status: 500 });
  }
}
