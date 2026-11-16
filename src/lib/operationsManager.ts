import { db } from './db';

export interface HandoverInput {
  bookingId: string;
  verifiedBy: string;
  odometerReading: number;
  fuelLevelPercent: number;
  conditionRating: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'DAMAGED';
  notes?: string;
  photos?: string[];
}

export interface ReturnInput {
  bookingId: string;
  verifiedBy: string;
  odometerReading: number;
  fuelLevelPercent: number;
  conditionRating: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'DAMAGED';
  notes?: string;
  photos?: string[];
  disputeRaised?: boolean;
  disputeNotes?: string;
}

/**
 * Executes vehicle handover at pickup time.
 * Verifies that the reservation is CONFIRMED, captures initial telemetry, and transitions booking to ACTIVE.
 */
export async function completeBookingHandover(input: HandoverInput) {
  const booking = await db.booking.findUnique({ where: { id: input.bookingId } });
  if (!booking) throw new Error('Booking not found');

  if (booking.status !== 'CONFIRMED') {
    throw new Error(`Cannot handover vehicle for booking in ${booking.status} state. Booking must be CONFIRMED.`);
  }

  // Create handover record
  const handover = await db.bookingHandover.create({
    data: {
      bookingId: booking.id,
      verifiedBy: input.verifiedBy,
      odometerReading: input.odometerReading,
      fuelLevelPercent: input.fuelLevelPercent,
      conditionRating: input.conditionRating,
      notes: input.notes || null,
      photosJson: JSON.stringify(input.photos || []),
      customerConfirmed: true,
      handoverStatus: 'COMPLETED',
    },
  });

  // Transition booking to ACTIVE
  await db.booking.update({
    where: { id: booking.id },
    data: {
      status: 'ACTIVE',
      _changedBy: input.verifiedBy,
    },
  });

  await db.auditLog.create({
    data: {
      action: 'VEHICLE_HANDOVER_COMPLETED',
      entityType: 'BOOKING',
      entityId: booking.id,
      details: `Handover recorded by ${input.verifiedBy}. Odo: ${input.odometerReading} km, Fuel: ${input.fuelLevelPercent}%. Status -> ACTIVE`,
    },
  });

  return handover;
}

/**
 * Executes vehicle return and inspection verification.
 * Compares against pickup values, marks booking COMPLETED or routes disputes to review.
 */
export async function completeBookingReturn(input: ReturnInput) {
  const booking = await db.booking.findUnique({ where: { id: input.bookingId } });
  if (!booking) throw new Error('Booking not found');

  if (booking.status !== 'ACTIVE' && booking.status !== 'CONFIRMED') {
    throw new Error(`Cannot return vehicle for booking in ${booking.status} state. Booking must be ACTIVE.`);
  }

  // Fetch handover record to compare
  const handover = await db.bookingHandover.findUnique({ where: { bookingId: booking.id } });

  let disputeRaised = Boolean(input.disputeRaised);
  let disputeNotes = input.disputeNotes || null;

  if (handover) {
    if (input.odometerReading < handover.odometerReading) {
      throw new Error('Return odometer reading cannot be less than pickup odometer reading.');
    }
    // Automatically flag if return condition degraded to DAMAGED
    if (input.conditionRating === 'DAMAGED' && handover.conditionRating !== 'DAMAGED') {
      disputeRaised = true;
      disputeNotes = disputeNotes || 'Vehicle returned with newly logged body panel / mechanical damage.';
    }
  }

  const returnRecord = await db.bookingReturnRecord.create({
    data: {
      bookingId: booking.id,
      verifiedBy: input.verifiedBy,
      odometerReading: input.odometerReading,
      fuelLevelPercent: input.fuelLevelPercent,
      conditionRating: input.conditionRating,
      notes: input.notes || null,
      photosJson: JSON.stringify(input.photos || []),
      disputeRaised,
      disputeNotes,
      returnStatus: 'COMPLETED',
    },
  });

  // If dispute raised, booking goes to COMPLETED but flagged in operations
  await db.booking.update({
    where: { id: booking.id },
    data: {
      status: 'COMPLETED',
      _changedBy: input.verifiedBy,
    },
  });

  await db.auditLog.create({
    data: {
      action: 'VEHICLE_RETURN_COMPLETED',
      entityType: 'BOOKING',
      entityId: booking.id,
      details: `Return verified by ${input.verifiedBy}. Odo: ${input.odometerReading} km, Fuel: ${input.fuelLevelPercent}%. Dispute: ${disputeRaised ? 'YES' : 'NO'}. Status -> COMPLETED`,
    },
  });

  return returnRecord;
}
