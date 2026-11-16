'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Vehicle, RentalType, Booking } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useMarketplace } from '@/context/MarketplaceContext';
import { PRICING_CONFIG } from '@/data/seedData';
import {
  Calendar,
  ShieldCheck,
  UserCheck,
  CreditCard,
  AlertCircle,
  X,
  Clock,
  Sparkles,
  Lock,
} from 'lucide-react';

interface BookingModalProps {
  vehicle: Vehicle;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ vehicle, onClose }) => {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { createBooking } = useMarketplace();

  // Tomorrow as default start, day after as return
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(formatDate(tomorrow));
  const [endDate, setEndDate] = useState(formatDate(dayAfter));
  const [rentalType, setRentalType] = useState<RentalType>(
    vehicle.supportedModes[0] || 'self-drive'
  );
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate days
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // Pricing breakdown
  const dailyRateTotal = vehicle.dailyRate * totalDays;
  const driverChargeDaily =
    rentalType === 'with-driver' ? vehicle.driverChargePerDay || 700 : 0;
  const driverChargeTotal = driverChargeDaily * totalDays;
  const subtotal = dailyRateTotal + driverChargeTotal;
  const serviceFee = Math.round((subtotal * PRICING_CONFIG.platformServiceFeePercent) / 100);
  const securityDeposit =
    PRICING_CONFIG.defaultSecurityDeposit[vehicle.category] || 1500;
  const totalAmount = subtotal + serviceFee + securityDeposit;
  const platformCommission = serviceFee;
  const ownerEarnings = subtotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (new Date(startDate) > new Date(endDate)) {
      setErrorMessage('Return date must be on or after pickup date.');
      return;
    }

    if (totalDays < vehicle.minimumDurationDays) {
      setErrorMessage(
        `This vehicle requires a minimum booking duration of ${vehicle.minimumDurationDays} days.`
      );
      return;
    }

    setIsSubmitting(true);

    const newBooking: Booking = {
      id: `bk-${Date.now().toString().slice(-6)}`,
      vehicleId: vehicle.id,
      vehicleTitle: vehicle.title,
      vehicleImage: vehicle.images[0] || '',
      vehicleCategory: vehicle.category,
      customerId: currentUser?.id || 'usr-customer-1',
      customerName: currentUser?.name || 'Rahul Sharma',
      customerEmail: currentUser?.email || 'customer@vahanloop.demo',
      customerPhone: currentUser?.phone || '+91 98765 43210',
      ownerId: vehicle.ownerId,
      startDate,
      endDate,
      totalDays,
      rentalType,
      dailyRate: vehicle.dailyRate,
      driverChargeTotal,
      serviceFee,
      securityDeposit,
      totalAmount,
      ownerEarnings,
      platformCommission,
      status: 'requested',
      createdAt: new Date().toISOString(),
    };

    const result = await createBooking(newBooking);

    if (result.success) {
      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
        router.push('/bookings');
      }, 400);
    } else {
      setIsSubmitting(false);
      setErrorMessage(result.error || 'Failed to request booking.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto custom-scrollbar border border-brand-border shadow-floating p-7 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-brand-text-muted hover:text-brand-navy p-1.5 rounded-full hover:bg-brand-surface transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1.5 text-brand-emerald font-bold text-xs tracking-wider uppercase">
          <Sparkles className="w-4 h-4" />
          <span>Direct Host Reservation</span>
        </div>

        <h2 className="text-2xl font-display font-extrabold text-brand-navy">Request Reservation</h2>
        <p className="text-xs text-brand-text-muted mt-0.5">
          {vehicle.title} · {vehicle.location}
        </p>

        {errorMessage && (
          <div className="mt-4 p-3.5 rounded-2xl bg-brand-danger/10 border border-brand-danger/20 text-brand-danger text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Rental Mode Selection */}
          <div>
            <label className="block text-[11px] font-bold text-brand-navy uppercase tracking-wider mb-2">
              Rental Mode
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setRentalType('self-drive')}
                disabled={!vehicle.supportedModes.includes('self-drive')}
                className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all text-center ${
                  rentalType === 'self-drive'
                    ? 'border-brand-navy bg-brand-navy text-white shadow-sm'
                    : 'border-brand-border bg-brand-surface text-brand-text-muted hover:text-brand-navy'
                } ${!vehicle.supportedModes.includes('self-drive') ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                Self-Drive Mode
              </button>
              <button
                type="button"
                onClick={() => setRentalType('with-driver')}
                disabled={!vehicle.supportedModes.includes('with-driver')}
                className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all text-center ${
                  rentalType === 'with-driver'
                    ? 'border-brand-navy bg-brand-navy text-white shadow-sm'
                    : 'border-brand-border bg-brand-surface text-brand-text-muted hover:text-brand-navy'
                } ${!vehicle.supportedModes.includes('with-driver') ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                With Chauffeur
              </button>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-brand-navy uppercase tracking-wider mb-1.5">
                Pickup Date
              </label>
              <input
                type="date"
                value={startDate}
                min={formatDate(new Date())}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs font-semibold rounded-2xl border border-brand-border bg-brand-surface text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-emerald"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-brand-navy uppercase tracking-wider mb-1.5">
                Return Date
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs font-semibold rounded-2xl border border-brand-border bg-brand-surface text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-emerald"
              />
            </div>
          </div>

          {/* Pricing Summary Card */}
          <div className="bg-brand-surface rounded-2xl p-4 border border-brand-border space-y-2 text-xs">
            <div className="flex justify-between text-brand-text-muted">
              <span>
                Base Rate (₹{vehicle.dailyRate.toLocaleString('en-IN')} × {totalDays} {totalDays === 1 ? 'day' : 'days'})
              </span>
              <span className="font-semibold text-brand-navy">₹{dailyRateTotal.toLocaleString('en-IN')}</span>
            </div>

            {rentalType === 'with-driver' && (
              <div className="flex justify-between text-brand-text-muted">
                <span>Chauffeur Service (₹{driverChargeDaily} × {totalDays} days)</span>
                <span className="font-semibold text-brand-navy">₹{driverChargeTotal.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="flex justify-between text-brand-text-muted">
              <span>Platform Service Fee ({PRICING_CONFIG.platformServiceFeePercent}%)</span>
              <span className="font-semibold text-brand-navy">₹{serviceFee.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between text-brand-text-muted">
              <span>Refundable Security Deposit</span>
              <span className="font-semibold text-brand-navy">₹{securityDeposit.toLocaleString('en-IN')}</span>
            </div>

            <div className="pt-2 border-t border-brand-border flex justify-between items-baseline font-bold text-brand-navy">
              <span className="text-sm font-display">Total Estimated Quotation</span>
              <span className="text-xl font-display font-black text-brand-navy">
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Host Notes */}
          <div>
            <label className="block text-[11px] font-bold text-brand-navy uppercase tracking-wider mb-1.5">
              Trip Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Destination, preferred pickup timing, or special requests..."
              className="w-full p-3 text-xs rounded-2xl border border-brand-border bg-brand-surface text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-emerald"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-full font-bold text-sm bg-brand-navy hover:bg-brand-emerald text-white transition-all shadow-floating flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>Submitting Request...</span>
            ) : (
              <>
                <CreditCard className="w-4 h-4 text-brand-emerald" />
                <span>Submit Reservation Request</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
