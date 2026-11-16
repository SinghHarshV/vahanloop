import { db } from './db';

export interface AssignDriverInput {
  bookingId: string;
  driverId: string;
  notes?: string;
}

export interface DriverAssignmentResult {
  success: boolean;
  assignment?: any;
  error?: string;
}

/**
 * Checks if a driver has any conflicting assignments during a trip time window.
 */
export async function hasDriverConflict(driverId: string, start: Date, end: Date, excludeBookingId?: string): Promise<boolean> {
  const existingAssignments = await db.driverTripAssignment.findMany({
    where: { driverId },
  });

  const activeAssignments = existingAssignments.filter((a: any) =>
    ['ASSIGNED', 'ACCEPTED', 'STARTED'].includes(a.status) &&
    (!excludeBookingId || a.bookingId !== excludeBookingId)
  );

  for (const assign of activeAssignments) {
    const bk = await db.booking.findUnique({ where: { id: assign.bookingId } });
    if (!bk) continue;
    const bStart = new Date(bk.pickupDateTime || bk.startDate).getTime();
    const bEnd = new Date(bk.returnDateTime || bk.endDate).getTime();
    const reqStart = new Date(start).getTime();
    const reqEnd = new Date(end).getTime();

    // Half-open interval conflict check: [reqStart, reqEnd) overlaps [bStart, bEnd)
    if (reqStart < bEnd && reqEnd > bStart) {
      return true;
    }
  }

  return false;
}

/**
 * Assigns a qualified commercial driver to a chauffeur-driven booking.
 */
export async function assignDriverToBooking(input: AssignDriverInput): Promise<DriverAssignmentResult> {
  const booking = await db.booking.findUnique({ where: { id: input.bookingId } });
  if (!booking) {
    return { success: false, error: 'Booking not found.' };
  }

  if (booking.rentalType !== 'CHAUFFEUR') {
    return { success: false, error: 'Driver assignment is only applicable to chauffeur-driven reservations.' };
  }

  const driver = await db.extendedDriverProfile.findUnique({ where: { id: input.driverId } });
  if (!driver) {
    return { success: false, error: 'Driver profile not found.' };
  }

  if (driver.licenceVerificationStatus !== 'VERIFIED') {
    return { success: false, error: 'Cannot assign driver whose commercial licence is unverified.' };
  }

  const pickup = new Date(booking.pickupDateTime || booking.startDate);
  const drop = new Date(booking.returnDateTime || booking.endDate);

  const conflict = await hasDriverConflict(driver.id, pickup, drop, booking.id);
  if (conflict) {
    return {
      success: false,
      error: `Driver ${driver.fullName} has a conflicting trip assignment during ${pickup.toLocaleDateString()} - ${drop.toLocaleDateString()}.`,
    };
  }

  // Create assignment
  const assignment = await db.driverTripAssignment.create({
    data: {
      bookingId: booking.id,
      driverId: driver.id,
      status: 'ASSIGNED',
      notes: input.notes || null,
    },
  });

  // Update driver availability status to ASSIGNED if currently AVAILABLE
  if (driver.availabilityStatus === 'AVAILABLE') {
    await db.extendedDriverProfile.update({
      where: { id: driver.id },
      data: { availabilityStatus: 'ASSIGNED' },
    });
  }

  // Audit log
  await db.auditLog.create({
    data: {
      action: 'DRIVER_ASSIGNED',
      entityType: 'BOOKING',
      entityId: booking.id,
      details: `Assigned driver ${driver.fullName} (${driver.id}) to booking ${booking.id}`,
    },
  });

  return { success: true, assignment };
}

/**
 * Driver updates assignment status (ACCEPTED, REJECTED, STARTED, COMPLETED).
 */
export async function updateDriverTripStatus(
  assignmentId: string,
  newStatus: 'ACCEPTED' | 'REJECTED' | 'STARTED' | 'COMPLETED',
  options?: { odometer?: number; rejectionReason?: string; notes?: string }
) {
  const assignments = await db.driverTripAssignment.findMany();
  const assign = assignments.find((a: any) => a.id === assignmentId);
  if (!assign) throw new Error('Assignment not found');

  const updateData: any = { status: newStatus };
  if (newStatus === 'STARTED') {
    updateData.tripStartTime = new Date();
    if (options?.odometer) updateData.startOdometer = options.odometer;
  } else if (newStatus === 'COMPLETED') {
    updateData.tripEndTime = new Date();
    if (options?.odometer) updateData.endOdometer = options.odometer;
  } else if (newStatus === 'REJECTED') {
    updateData.rejectionReason = options?.rejectionReason || 'Driver declined assignment';
  }

  const updated = await db.driverTripAssignment.update({
    where: { id: assignmentId },
    data: updateData,
  });

  // Update driver's overall availability
  if (newStatus === 'STARTED') {
    await db.extendedDriverProfile.update({
      where: { id: assign.driverId },
      data: { availabilityStatus: 'ON_DUTY' },
    });
  } else if (newStatus === 'COMPLETED' || newStatus === 'REJECTED') {
    // Check if other active assignments exist
    const hasOther = await db.driverTripAssignment.findMany({ where: { driverId: assign.driverId } });
    const stillBusy = hasOther.some((a: any) => a.id !== assignmentId && ['ASSIGNED', 'STARTED'].includes(a.status));
    await db.extendedDriverProfile.update({
      where: { id: assign.driverId },
      data: { availabilityStatus: stillBusy ? 'ASSIGNED' : 'AVAILABLE' },
    });
  }

  return updated;
}
