import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { vehicleCreateSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const rentalType = searchParams.get('rentalType');
    const fuelType = searchParams.get('fuelType');
    const transmission = searchParams.get('transmission');
    const maxPrice = searchParams.get('maxPrice');
    const q = searchParams.get('q');

    // Fetch vehicles
    const vehicles = await db.vehicle.findMany({
      where: {
        approvalStatus: 'APPROVED',
        availabilityStatus: 'AVAILABLE',
      },
    });

    let filtered = vehicles;

    if (category && category !== 'all') {
      filtered = filtered.filter((v: any) => v.category.toLowerCase() === category.toLowerCase());
    }

    if (location && location !== 'all') {
      filtered = filtered.filter((v: any) => v.location.toLowerCase().includes(location.toLowerCase()));
    }

    if (rentalType === 'self-drive' || rentalType === 'SELF_DRIVE') {
      filtered = filtered.filter((v: any) => v.selfDriveEnabled);
    } else if (rentalType === 'with-driver' || rentalType === 'CHAUFFEUR') {
      filtered = filtered.filter((v: any) => v.chauffeurEnabled);
    }

    if (fuelType && fuelType !== 'all') {
      filtered = filtered.filter((v: any) => v.fuelType.toLowerCase() === fuelType.toLowerCase());
    }

    if (transmission && transmission !== 'all') {
      filtered = filtered.filter(
        (v: any) => v.transmission.toLowerCase() === transmission.toLowerCase()
      );
    }

    if (maxPrice) {
      const max = Number(maxPrice);
      if (!isNaN(max)) {
        filtered = filtered.filter((v: any) => v.dailyRentalPrice <= max);
      }
    }

    if (q) {
      const query = q.toLowerCase();
      filtered = filtered.filter(
        (v: any) =>
          v.make.toLowerCase().includes(query) ||
          v.model.toLowerCase().includes(query) ||
          v.location.toLowerCase().includes(query)
      );
    }

    return NextResponse.json({ vehicles: filtered });
  } catch (error: any) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json({ error: 'Failed to fetch vehicles' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);

    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!session.roles.includes('OWNER') && !session.roles.includes('ADMIN')) {
      return NextResponse.json(
        { error: 'Forbidden: Only registered vehicle partners can list vehicles' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = vehicleCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Check duplicate registration number
    const existingReg = db.store.vehicles.find(
      (v: any) => v.registrationNumber.toUpperCase() === data.registrationNumber.toUpperCase()
    );
    if (existingReg) {
      return NextResponse.json(
        { error: 'A vehicle with this registration number is already registered' },
        { status: 400 }
      );
    }

    const vehicle = await db.vehicle.create({
      data: {
        ownerId: session.userId,
        category: data.category,
        make: data.make,
        model: data.model,
        registrationNumber: data.registrationNumber.toUpperCase(),
        manufacturingYear: data.manufacturingYear,
        fuelType: data.fuelType,
        transmission: data.transmission,
        seatingCapacity: data.seatingCapacity,
        description: data.description || '',
        location: data.location,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        dailyRentalPrice: data.dailyRentalPrice,
        driverCharge: data.driverCharge || 0,
        selfDriveEnabled: data.selfDriveEnabled,
        chauffeurEnabled: data.chauffeurEnabled,
        approvalStatus: 'PENDING', // Always PENDING until approved by admin
        availabilityStatus: 'AVAILABLE',
        images: {
          create: data.images.map((url, idx) => ({
            imageUrl: url,
            imageType: idx === 0 ? 'COVER' : 'EXTERIOR',
          })),
        },
        documents: {
          create: [
            { documentType: 'RC', verificationStatus: 'PENDING' },
            { documentType: 'INSURANCE', verificationStatus: 'PENDING' },
            { documentType: 'PUC', verificationStatus: 'PENDING' },
          ],
        },
      },
    });

    await db.auditLog.create({
      data: {
        actorId: session.userId,
        action: 'VEHICLE_CREATED',
        entityType: 'VEHICLE',
        entityId: vehicle.id,
        details: `Created vehicle listing ${vehicle.make} ${vehicle.model} (pending approval)`,
      },
    });

    return NextResponse.json(
      { message: 'Vehicle created successfully and submitted for administrator review', vehicle },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating vehicle:', error);
    return NextResponse.json({ error: 'Internal server error creating vehicle' }, { status: 500 });
  }
}
