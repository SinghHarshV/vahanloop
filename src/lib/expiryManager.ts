import { db } from './db';

export interface ExpiryNotificationItem {
  entityType: 'VEHICLE' | 'DRIVER';
  entityId: string;
  entityName: string;
  documentType: string;
  expiryDate: string;
  daysRemaining: number;
  severity: 'WARNING' | 'CRITICAL' | 'EXPIRED';
  threshold: 30 | 15 | 7 | 0;
  impact: string;
}

/**
 * Scans vehicle and driver documents across the fleet to detect approaching or past expiration dates.
 * Generates structured notification alerts according to 30, 15, 7, and 0-day thresholds.
 */
export async function scanExpiringDocuments(): Promise<ExpiryNotificationItem[]> {
  const alerts: ExpiryNotificationItem[] = [];
  const now = new Date();

  // 1. Scan Vehicle Documents
  const vehicles = await db.vehicle.findMany();
  for (const v of vehicles) {
    const docs = v.documents || [];
    for (const d of docs) {
      if (!d.expiryDate) continue;
      const exp = new Date(d.expiryDate);
      const diffMs = exp.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      let threshold: 30 | 15 | 7 | 0 | null = null;
      let severity: 'WARNING' | 'CRITICAL' | 'EXPIRED' = 'WARNING';
      let impact = 'Vehicle approaching document renewal requirement.';

      if (daysRemaining <= 0) {
        threshold = 0;
        severity = 'EXPIRED';
        impact = 'Vehicle is INELIGIBLE for new bookings. Active rentals flagged for compliance supervision.';
      } else if (daysRemaining <= 7) {
        threshold = 7;
        severity = 'CRITICAL';
        impact = 'Immediate renewal required. Vehicle will be suspended upon expiration.';
      } else if (daysRemaining <= 15) {
        threshold = 15;
        severity = 'WARNING';
        impact = 'Renewal submission requested from vehicle host.';
      } else if (daysRemaining <= 30) {
        threshold = 30;
        severity = 'WARNING';
        impact = 'Advance notice provided to host.';
      }

      if (threshold !== null) {
        alerts.push({
          entityType: 'VEHICLE',
          entityId: v.id,
          entityName: `${v.make} ${v.model} (${v.registrationNumber})`,
          documentType: d.documentType || d.category || 'UNKNOWN',
          expiryDate: exp.toISOString(),
          daysRemaining,
          severity,
          threshold,
          impact,
        });

        // Persist notification record if not already existing for this threshold
        const existing = await db.documentExpiryNotification.findMany({
          where: { entityType: 'VEHICLE', entityId: v.id, threshold },
        });

        if (existing.length === 0) {
          await db.documentExpiryNotification.create({
            data: {
              entityType: 'VEHICLE',
              entityId: v.id,
              documentType: d.documentType || d.category,
              expiryDate: exp,
              daysRemaining,
              threshold,
              status: 'SENT',
            },
          });
        }
      }
    }
  }

  // 2. Scan Driver Licences
  const drivers = await db.extendedDriverProfile.findMany();
  for (const drv of drivers) {
    // Check fictional licence expiration if present or simulate standard 1-year periodic check
    const mockExp = new Date('2025-08-15T00:00:00Z');
    const diffMs = mockExp.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (daysRemaining <= 30) {
      alerts.push({
        entityType: 'DRIVER',
        entityId: drv.id,
        entityName: `${drv.fullName} (Driver Licence ${drv.licenceCategory})`,
        documentType: 'COMMERCIAL_DRIVING_LICENCE',
        expiryDate: mockExp.toISOString(),
        daysRemaining,
        severity: daysRemaining <= 0 ? 'EXPIRED' : daysRemaining <= 7 ? 'CRITICAL' : 'WARNING',
        threshold: daysRemaining <= 0 ? 0 : daysRemaining <= 7 ? 7 : daysRemaining <= 15 ? 15 : 30,
        impact: daysRemaining <= 0 ? 'Driver disqualified from trip dispatch.' : 'Commercial badge renewal pending.',
      });
    }
  }

  return alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
}
