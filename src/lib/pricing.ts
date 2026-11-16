export interface PricingInput {
  category: 'CAR' | 'BIKE' | 'SCOOTER';
  dailyRate: number; // in INR
  startDate: string | Date;
  endDate: string | Date;
  rentalType: 'SELF_DRIVE' | 'CHAUFFEUR';
  driverChargePerDay?: number; // in INR
  extraKm?: number;
  extraKmRate?: number; // in INR
}

export interface PriceSnapshot {
  currency: 'INR';
  durationDays: number;
  dailyRatePaise: number;
  baseRentalPricePaise: number;
  chauffeurFeePaise: number;
  extraKmChargePaise: number;
  subtotalPaise: number;
  serviceFeePaise: number; // 10% platform fee
  estimatedTaxPaise: number; // 5% GST estimate
  securityDepositPaise: number; // Car: 2000 INR, Bike: 1500 INR, Scooter: 1000 INR
  totalPayablePaise: number;
  // Formatted INR display helpers
  formatted: {
    dailyRate: string;
    baseRental: string;
    chauffeurFee: string;
    extraKmCharge: string;
    serviceFee: string;
    estimatedTax: string;
    securityDeposit: string;
    totalPayable: string;
  };
}

export const SECURITY_DEPOSIT_INR: Record<string, number> = {
  CAR: 2000,
  BIKE: 1500,
  SCOOTER: 1000,
};

export function toPaise(inr: number): number {
  return Math.round(inr * 100);
}

export function toInr(paise: number): number {
  return paise / 100;
}

export function formatINR(paise: number): string {
  const inr = toInr(paise);
  return `₹${inr.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/**
 * Pure server-side pricing engine.
 * Guarantees zero floating-point rounding errors by calculating in integer paise.
 */
export function calculateBookingPrice(input: PricingInput): PriceSnapshot {
  const start = new Date(input.startDate);
  const end = new Date(input.endDate);

  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  const dailyRatePaise = toPaise(input.dailyRate);
  const baseRentalPricePaise = dailyRatePaise * diffDays;

  // Chauffeur fee
  let chauffeurFeePaise = 0;
  if (input.rentalType === 'CHAUFFEUR') {
    const driverRate = input.driverChargePerDay && input.driverChargePerDay > 0 ? input.driverChargePerDay : 700;
    chauffeurFeePaise = toPaise(driverRate) * diffDays;
  }

  // Extra km charge
  const extraKm = input.extraKm && input.extraKm > 0 ? input.extraKm : 0;
  const extraKmRate = input.extraKmRate && input.extraKmRate > 0 ? input.extraKmRate : 12;
  const extraKmChargePaise = toPaise(extraKm * extraKmRate);

  const subtotalPaise = baseRentalPricePaise + chauffeurFeePaise + extraKmChargePaise;

  // 10% platform fee
  const serviceFeePaise = Math.round(subtotalPaise * 0.1);

  // 5% GST estimate
  const estimatedTaxPaise = Math.round(subtotalPaise * 0.05);

  // Security deposit
  const catKey = (input.category || 'CAR').toUpperCase();
  const depositInr = SECURITY_DEPOSIT_INR[catKey] ?? 2000;
  const securityDepositPaise = toPaise(depositInr);

  const totalPayablePaise = subtotalPaise + serviceFeePaise + estimatedTaxPaise + securityDepositPaise;

  return {
    currency: 'INR',
    durationDays: diffDays,
    dailyRatePaise,
    baseRentalPricePaise,
    chauffeurFeePaise,
    extraKmChargePaise,
    subtotalPaise,
    serviceFeePaise,
    estimatedTaxPaise,
    securityDepositPaise,
    totalPayablePaise,
    formatted: {
      dailyRate: formatINR(dailyRatePaise),
      baseRental: formatINR(baseRentalPricePaise),
      chauffeurFee: formatINR(chauffeurFeePaise),
      extraKmCharge: formatINR(extraKmChargePaise),
      serviceFee: formatINR(serviceFeePaise),
      estimatedTax: formatINR(estimatedTaxPaise),
      securityDeposit: formatINR(securityDepositPaise),
      totalPayable: formatINR(totalPayablePaise),
    },
  };
}
