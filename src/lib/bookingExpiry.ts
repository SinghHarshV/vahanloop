import { db } from './db';

export const RESERVATION_HOLD_MINUTES = 15;

export interface ExpiryCheckResult {
  expiredCount: number;
  expiredIds: string[];
}

/**
 * Checks for any bookings in ACCEPTED or AWAITING_PAYMENT status
 * whose expiresAt timestamp is in the past.
 * Releases availability and transitions status to EXPIRED.
 * Safe to execute periodically or prior to critical booking actions.
 */
export async function checkAndExpireReservations(): Promise<ExpiryCheckResult> {
  const now = new Date();
  const expiredIds: string[] = [];

  try {
    const pendingBookings = await db.booking.findMany({
      where: {
        status: { in: ['ACCEPTED', 'AWAITING_PAYMENT'] },
      },
    });

    for (const b of pendingBookings) {
      if (b.expiresAt && new Date(b.expiresAt).getTime() < now.getTime()) {
        await db.booking.update({
          where: { id: b.id },
          data: {
            status: 'EXPIRED',
            rejectionReason: `Reservation expired. Customer did not complete payment within ${RESERVATION_HOLD_MINUTES} minutes.`,
          },
        });

        // Record history
        if (db.bookingStatusHistory?.create) {
          await db.bookingStatusHistory.create({
            data: {
              bookingId: b.id,
              previousStatus: b.status,
              newStatus: 'EXPIRED',
              changedBy: 'SYSTEM_EXPIRY_ENGINE',
              note: 'Automated 15-minute reservation expiry',
            },
          });
        }

        // Create notifications for customer and owner
        if (db.notification?.create) {
          await db.notification.create({
            data: {
              userId: b.customerId,
              title: 'Reservation Expired',
              message: `Your booking reservation for vehicle (${b.vehicleId}) has expired due to non-payment.`,
              type: 'WARNING',
            },
          });

          if (b.vehicle?.ownerId) {
            await db.notification.create({
              data: {
                userId: b.vehicle.ownerId,
                title: 'Vehicle Availability Released',
                message: `Reservation ${b.id} expired. Your vehicle is now back on the marketplace.`,
                type: 'INFO',
              },
            });
          }
        }

        expiredIds.push(b.id);
      }
    }

    return {
      expiredCount: expiredIds.length,
      expiredIds,
    };
  } catch (error) {
    console.error('Error during reservation expiry check:', error);
    return { expiredCount: 0, expiredIds: [] };
  }
}
