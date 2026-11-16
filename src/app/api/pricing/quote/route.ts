import { NextRequest, NextResponse } from 'next/server';
import { calculateBookingPrice } from '@/lib/pricing';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vehicleId, startDate, endDate, rentalType, extraKm } = body;

    if (!vehicleId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'vehicleId, startDate, and endDate are required' },
        { status: 400 }
      );
    }

    const vehicle = await db.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    const priceQuote = calculateBookingPrice({
      category: vehicle.category as any,
      dailyRate: vehicle.dailyRentalPrice,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      rentalType: (rentalType || 'SELF_DRIVE') as any,
      driverChargePerDay: vehicle.driverCharge || 700,
      extraKm: Number(extraKm || 0),
    });

    return NextResponse.json({
      success: true,
      quote: priceQuote,
      vehicle: {
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        category: vehicle.category,
        location: vehicle.location,
      },
    });
  } catch (error: any) {
    console.error('Pricing quote error:', error);
    return NextResponse.json({ error: 'Failed to generate price quotation' }, { status: 500 });
  }
}
