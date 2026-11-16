import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Find organisations where user is a member
  const members = await db.fleetMember.findMany({ where: { userId: user.id } });
  const orgIds = members.map((m: any) => m.orgId);

  let organisations: any[] = [];
  if (user.roles.includes('ADMIN')) {
    organisations = await db.businessOrganisation.findMany();
  } else {
    organisations = (await db.businessOrganisation.findMany()).filter((o: any) => orgIds.includes(o.id));
  }

  // Get vehicles for fleet
  const assignments = await db.fleetVehicleAssignment.findMany();
  const locations = await db.fleetLocation.findMany();

  return NextResponse.json({
    organisations,
    locations,
    assignments,
  });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'CREATE_ORGANISATION') {
      const { businessName, businessType, registeredAddress, panNumber, gstin, contactPerson, contactPhone, contactEmail } = body;
      const org = await db.businessOrganisation.create({
        data: {
          businessName,
          businessType: businessType || 'PVT_LTD',
          registeredAddress,
          panNumber: panNumber || null,
          gstin: gstin || null,
          contactPerson: contactPerson || user.fullName,
          contactEmail: contactEmail || user.email,
          contactPhone: contactPhone || user.phone,
          verificationStatus: 'SUBMITTED',
        },
      });

      // Add user as OWNER member
      await db.fleetMember.create({
        data: {
          orgId: org.id,
          userId: user.id,
          role: 'OWNER',
          permissions: 'ALL',
        },
      });

      return NextResponse.json({ success: true, organisation: org });
    } else if (action === 'ASSIGN_VEHICLE') {
      const { vehicleId, orgId, locationId } = body;
      const assign = await db.fleetVehicleAssignment.create({
        data: { vehicleId, orgId, locationId: locationId || null },
      });
      return NextResponse.json({ success: true, assignment: assign });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Fleet operation failed' }, { status: 500 });
  }
}
