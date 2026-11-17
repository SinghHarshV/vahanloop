export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { bookingCreateSchema } from '@/lib/validations';
import { calculateBookingPrice } from '@/lib/pricing';
import { checkAndExpireReservations } from '@/lib/bookingExpiry';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Trigger proactive expiry evaluation
    await checkAndExpireReservations();

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

    // Proactively clean up any expired reservations to immediately free vehicles
    await checkAndExpireReservations();

    const body = await req.json();
    const parsed = bookingCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid booking data', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { vehicleId, rentalType, pickupDateTime, returnDateTime, pickupLocation, dropLocation } =
      parsed.data;

    const start = new Date(pickupDateTime);
    const end = new Date(returnDateTime);

    if (start.getTime() >= end.getTime()) {
      return NextResponse.json(
        { error: 'Invalid dates: Return time must be after pickup time' },
        { status: 400 }
      );
    }

    // Prevent bookings in the deep past
    if (end.getTime() < Date.now() - 3600000) {
      return NextResponse.json(
        { error: 'Invalid dates: Pickup and return cannot be in the past' },
        { status: 400 }
      );
    }

    // Find vehicle
    const vehicle = await db.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    if (vehicle.availabilityStatus !== 'AVAILABLE') {
      return NextResponse.json(
        { error: 'This vehicle is currently not available for bookings' },
        { status: 400 }
      );
    }

    // Prevent hosts from renting their own vehicles
    if (vehicle.ownerId === session.userId) {
      return NextResponse.json(
        { error: 'Partners cannot book their own registered vehicles' },
        { status: 400 }
      );
    }

    // Check rental mode capability
    if (rentalType === 'CHAUFFEUR' && !vehicle.chauffeurEnabled) {
      return NextResponse.json(
        { error: 'Chauffeur rental mode is not supported for this vehicle' },
        { status: 400 }
      );
    }
    if (rentalType === 'SELF_DRIVE' && !vehicle.selfDriveEnabled) {
      return NextResponse.json(
        { error: 'Self-drive rental mode is not supported for this vehicle' },
        { status: 400 }
      );
    }

    // Pure centralized server-side price calculation (never trusting browser)
    const priceQuote = calculateBookingPrice({
      category: vehicle.category as any,
      dailyRate: vehicle.dailyRentalPrice,
      startDate: start,
      endDate: end,
      rentalType: rentalType as any,
      driverChargePerDay: vehicle.driverCharge || 700,
    });

    const basePrice = priceQuote.baseRentalPricePaise / 100;
    const driverCharge = priceQuote.chauffeurFeePaise / 100;
    const serviceFee = priceQuote.serviceFeePaise / 100;
    const securityDeposit = priceQuote.securityDepositPaise / 100;
    const totalAmount = priceQuote.totalPayablePaise / 100;

    // Transaction & Date Collision Check
    const result = await db.$transaction(async (tx: any) => {
      // Find all existing conflicting bookings
      const existingBookings = await tx.booking.findMany({
        where: { vehicleId: vehicle.id },
      });

      const activeHoldingStatuses = ['ACCEPTED', 'AWAITING_PAYMENT', 'CONFIRMED', 'ACTIVE'];

      // Half-open interval conflict check: [start, end)
      const hasConflict = existingBookings.some((b: any) => {
        if (!activeHoldingStatuses.includes(b.status)) return false;
        const bStart = new Date(b.pickupDateTime).getTime();
        const bEnd = new Date(b.returnDateTime).getTime();
        const reqStart = start.getTime();
        const reqEnd = end.getTime();

        // Half-open interval: overlapping if reqStart < bEnd && reqEnd > bStart
        return reqStart < bEnd && reqEnd > bStart;
      });

      if (hasConflict) {
        return {
          conflict: true,
          error:
            'This vehicle has an accepted or confirmed reservation holding the requested dates. Please choose another date range.',
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

      // Save immutable price snapshot
      if (tx.bookingPriceSnapshot?.create) {
        await tx.bookingPriceSnapshot.create({
          data: {
            bookingId: booking.id,
            currency: 'INR',
            baseRentalPricePaise: priceQuote.baseRentalPricePaise,
            durationDays: priceQuote.durationDays,
            dailyRatePaise: priceQuote.dailyRatePaise,
            chauffeurFeePaise: priceQuote.chauffeurFeePaise,
            extraKmChargePaise: priceQuote.extraKmChargePaise,
            serviceFeePaise: priceQuote.serviceFeePaise,
            estimatedTaxPaise: priceQuote.estimatedTaxPaise,
            securityDepositPaise: priceQuote.securityDepositPaise,
            totalPayablePaise: priceQuote.totalPayablePaise,
            formattedInr: priceQuote.formatted.totalPayable,
          },
        });
      }

      // Record initial history
      if (tx.bookingStatusHistory?.create) {
        await tx.bookingStatusHistory.create({
          data: {
            bookingId: booking.id,
            previousStatus: null,
            newStatus: 'REQUESTED',
            changedBy: session.userId,
            note: 'Customer submitted rental request',
          },
        });
      }

      return { conflict: false, booking };
    });

    if (result.conflict) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    // Create owner notification
    if (db.notification?.create) {
      await db.notification.create({
        data: {
          userId: vehicle.ownerId,
          title: 'New Booking Request',
          message: `Guest ${session.fullName || session.email} requested a rental for ${vehicle.make} ${vehicle.model}.`,
          type: 'INFO',
          link: '/owner/requests',
        },
      });
    }

    await db.auditLog.create({
      data: {
        actorId: session.userId,
        action: 'BOOKING_REQUESTED',
        entityType: 'BOOKING',
        entityId: result.booking.id,
        details: `Requested booking for ${vehicle.make} ${vehicle.model} by ${session.email}. Total: ₹${totalAmount}`,
      },
    });

    return NextResponse.json(
      { message: 'Booking request sent successfully to host', booking: result.booking, priceQuote },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Internal server error creating booking' }, { status: 500 });
  }
}
