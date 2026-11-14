import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { bookingCreateSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const roleParam = searchParams.get('role'); // e.g., 'owner' or 'customer'

    let bookings;
    if (session.roles.includes('ADMIN') && roleParam === 'all') {
      bookings = await db.booking.findMany({ orderBy: { createdAt: 'desc' } });
    } else if (session.roles.includes('OWNER') && roleParam === 'owner') {
      bookings = await db.booking.findMany({
        where: { vehicle: { ownerId: session.userId } },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // Default: customer's own bookings
      bookings = await db.booking.findMany({
        where: { customerId: session.userId },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json({ bookings });
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = bookingCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { vehicleId, rentalType, pickupDateTime, returnDateTime, pickupLocation, dropLocation } =
      parsed.data;

    const start = new Date(pickupDateTime);
    const end = new Date(returnDateTime);

    if (start >= end) {
      return NextResponse.json(
        { error: 'Return date and time must be after pickup date and time' },
        { status: 400 }
      );
    }

    // Server-side calculation of duration
    const diffMs = end.getTime() - start.getTime();
    const totalDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    // Fetch vehicle
    const vehicle = await db.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    if (vehicle.approvalStatus !== 'APPROVED' || vehicle.availabilityStatus !== 'AVAILABLE') {
      return NextResponse.json(
        { error: 'Vehicle is not currently available for public booking' },
        { status: 400 }
      );
    }

    // Validate mode support
    if (rentalType === 'CHAUFFEUR' && !vehicle.chauffeurEnabled) {
      return NextResponse.json(
        { error: 'Chauffeur rental is not offered for this vehicle' },
        { status: 400 }
      );
    }

    if (rentalType === 'SELF_DRIVE' && !vehicle.selfDriveEnabled) {
      return NextResponse.json(
        { error: 'Self-drive rental is not offered for this vehicle' },
        { status: 400 }
      );
    }

    // Server-side price calculation
    const basePrice = Math.round(vehicle.dailyRentalPrice * totalDays);
    const dailyDriverCharge =
      rentalType === 'CHAUFFEUR' ? vehicle.driverCharge || 700 : 0;
    const driverCharge = Math.round(dailyDriverCharge * totalDays);
    const subtotal = basePrice + driverCharge;
    const serviceFee = Math.round(subtotal * 0.1); // 10%

    // Security deposit by category
    let securityDeposit = 2000;
    if (vehicle.category === 'BIKE') securityDeposit = 1500;
    if (vehicle.category === 'SCOOTER') securityDeposit = 1000;

    const totalAmount = subtotal + serviceFee + securityDeposit;

    // Transaction & Date Collision Check
    const result = await db.$transaction(async (tx: any) => {
      // Find all existing conflicting bookings
      const existingBookings = await tx.booking.findMany({
        where: { vehicleId: vehicle.id },
      });

      const activeStatuses = ['ACCEPTED', 'AWAITING_PAYMENT', 'CONFIRMED', 'ACTIVE'];

      const hasConflict = existingBookings.some((b: any) => {
        if (!activeStatuses.includes(b.status)) return false;
        const bStart = new Date(b.pickupDateTime).getTime();
        const bEnd = new Date(b.returnDateTime).getTime();
        const reqStart = start.getTime();
        const reqEnd = end.getTime();

        // Date overlap formula
        return reqStart <= bEnd && reqEnd >= bStart;
      });

      if (hasConflict) {
        return {
          conflict: true,
          error:
            'This vehicle has an accepted or confirmed reservation for the requested dates. Please choose another date range.',
        };
      }

      const booking = await tx.booking.create({
        data: {
          customerId: session.userId,
          vehicleId: vehicle.id,
          rentalType,
          pickupDateTime: start,
          returnDateTime: end,
          pickupLocation,
          dropLocation,
          basePrice,
          driverCharge,
          serviceFee,
          securityDeposit,
          totalAmount,
          status: 'REQUESTED',
        },
      });

      return { conflict: false, booking };
    });

    if (result.conflict) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    await db.auditLog.create({
      data: {
        actorId: session.userId,
        action: 'BOOKING_REQUESTED',
        entityType: 'BOOKING',
        entityId: result.booking.id,
        details: `Requested booking for ${vehicle.make} ${vehicle.model} by ${session.email}`,
      },
    });

    return NextResponse.json(
      { message: 'Booking request sent successfully to host', booking: result.booking },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Internal server error creating booking' }, { status: 500 });
  }
}
