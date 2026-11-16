import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId is required' }, { status: 400 });
    }

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Access control
    const isParticipant =
      booking.customerId === session.userId ||
      booking.vehicle?.ownerId === session.userId ||
      session.roles.includes('ADMIN');

    if (!isParticipant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const inspections = db.bookingInspection?.findMany
      ? await db.bookingInspection.findMany({
          where: { bookingId },
          include: { items: true, media: true },
        })
      : [];

    return NextResponse.json({ inspections });
  } catch (error: any) {
    console.error('Error fetching inspections:', error);
    return NextResponse.json({ error: 'Failed to fetch inspections' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const {
      bookingId,
      inspectionType, // 'PICKUP' | 'RETURN'
      odometerReading,
      fuelLevelPercent,
      vehicleCondition,
      visibleDamage,
      items,
      mediaUrls,
    } = body;

    if (!bookingId || !inspectionType || odometerReading === undefined || fuelLevelPercent === undefined) {
      return NextResponse.json(
        { error: 'bookingId, inspectionType, odometerReading, and fuelLevelPercent are required' },
        { status: 400 }
      );
    }

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Only host or authorized customer or admin can submit inspection
    const isOwner = session.userId === booking.vehicle?.ownerId;
    const isCustomer = session.userId === booking.customerId;
    const isAdmin = session.roles.includes('ADMIN');

    if (!isOwner && !isCustomer && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Only booking participants or administrators can submit inspections' },
        { status: 403 }
      );
    }

    // Check if inspection of this type was already submitted (prevent silent overwrites)
    if (db.bookingInspection?.findUnique) {
      const existing = await db.bookingInspection.findUnique({
        where: {
          bookingId_inspectionType: {
            bookingId,
            inspectionType,
          },
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: `An inspection for ${inspectionType} has already been recorded for this booking.` },
          { status: 409 }
        );
      }
    }

    const inspection = db.bookingInspection?.create
      ? await db.bookingInspection.create({
          data: {
            bookingId,
            inspectionType,
            odometerReading: Number(odometerReading),
            fuelLevelPercent: Number(fuelLevelPercent),
            vehicleCondition: vehicleCondition || 'GOOD',
            visibleDamage: visibleDamage || null,
            inspectorId: session.userId,
            items: {
              create: (items || []).map((it: any) => ({
                component: it.component,
                statusOk: it.statusOk ?? true,
                notes: it.notes || null,
              })),
            },
            media: {
              create: (mediaUrls || []).map((m: any) => ({
                mediaUrl: typeof m === 'string' ? m : m.mediaUrl,
                caption: typeof m === 'object' ? m.caption : null,
              })),
            },
          },
        })
      : {
          id: `insp_${Date.now()}`,
          bookingId,
          inspectionType,
          odometerReading,
          fuelLevelPercent,
          vehicleCondition,
        };

    // If RETURN inspection submitted, advance booking status to COMPLETED
    if (inspectionType === 'RETURN' && booking.status === 'ACTIVE' || booking.status === 'CONFIRMED') {
      await db.booking.update({
        where: { id: bookingId },
        data: { status: 'COMPLETED' },
      });
    }

    await db.auditLog.create({
      data: {
        actorId: session.userId,
        action: `INSPECTION_SUBMITTED_${inspectionType}`,
        entityType: 'BOOKING_INSPECTION',
        entityId: bookingId,
        details: `Recorded ${inspectionType} inspection. Odo: ${odometerReading} km, Fuel: ${fuelLevelPercent}%. Inspector: ${session.email}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${inspectionType} inspection logged successfully.`,
      inspection,
    });
  } catch (error: any) {
    console.error('Inspection submission error:', error);
    return NextResponse.json({ error: 'Failed to record inspection' }, { status: 500 });
  }
}
