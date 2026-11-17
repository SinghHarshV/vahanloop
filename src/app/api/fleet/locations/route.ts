export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get('city');

  let locations = await db.fleetLocation.findMany();
  if (city) {
    locations = locations.filter((l: any) => l.city.toLowerCase() === city.toLowerCase());
  }

  return NextResponse.json({ locations });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { orgId, name, address, city, postalCode, latitude, longitude, contactPerson, contactNumber, operatingHours, pickupInstructions } = body;

    if (!orgId || !name || !address || !city) {
      return NextResponse.json({ error: 'Missing mandatory location fields' }, { status: 400 });
    }

    const loc = await db.fleetLocation.create({
      data: {
        orgId,
        name,
        address,
        city,
        postalCode: postalCode || '560001',
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        contactPerson: contactPerson || user.fullName,
        contactNumber: contactNumber || user.phone,
        operatingHours: operatingHours || '08:00 - 20:00',
        pickupInstructions: pickupInstructions || null,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, location: loc });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create location' }, { status: 500 });
  }
}
