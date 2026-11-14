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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto custom-scrollbar border border-slate-200 shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1 text-emerald-600 font-semibold text-xs tracking-wider uppercase">
          <Sparkles className="w-4 h-4" />
          <span>Demonstration Booking Workflow</span>
        </div>

        <h2 className="text-xl font-bold text-slate-900">Request Vehicle Reservation</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {vehicle.title} · {vehicle.location}
        </p>

        {errorMessage && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Rental Mode Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Choose Rental Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRentalType('self-drive')}
                disabled={!vehicle.supportedModes.includes('self-drive')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  rentalType === 'self-drive'
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                } ${!vehicle.supportedModes.includes('self-drive') ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Self-Drive</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">Standard</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Drive yourself freely</p>
              </button>

              <button
                type="button"
                onClick={() => setRentalType('with-driver')}
                disabled={!vehicle.supportedModes.includes('with-driver')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  rentalType === 'with-driver'
                    ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                } ${!vehicle.supportedModes.includes('with-driver') ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">With Chauffeur</span>
                  <span className="text-[10px] text-blue-700 font-semibold">
                    +₹{vehicle.driverChargePerDay || 700}/day
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Verified partner driver</p>
              </button>
            </div>
          </div>

          {/* Date Range Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Pickup Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                min={formatDate(new Date())}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Return Date
              </label>
              <input
                type="date"
                required
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="text-xs text-slate-500 flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Duration: {totalDays} {totalDays === 1 ? 'day' : 'days'}
            </span>
            <span className="text-slate-400">
              Min duration: {vehicle.minimumDurationDays} {vehicle.minimumDurationDays === 1 ? 'day' : 'days'}
            </span>
          </div>

          {/* Price Breakdown Card */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-800 text-[13px] border-b border-slate-200 pb-2">
              <span>Price Breakdown</span>
              <span className="text-[10px] text-slate-500 font-normal">Simulated Demo Rates</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>
                Daily Rental (₹{vehicle.dailyRate} × {totalDays} days)
              </span>
              <span className="font-semibold text-slate-800">
                ₹{dailyRateTotal.toLocaleString('en-IN')}
              </span>
            </div>

            {rentalType === 'with-driver' && (
              <div className="flex justify-between text-slate-600">
                <span>
                  Chauffeur Service (₹{driverChargeDaily} × {totalDays} days)
                </span>
                <span className="font-semibold text-blue-700">
                  ₹{driverChargeTotal.toLocaleString('en-IN')}
                </span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>Platform Service Fee ({PRICING_CONFIG.platformServiceFeePercent}%)</span>
              <span className="font-semibold text-slate-800">
                ₹{serviceFee.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span className="flex items-center gap-1">
                Refundable Security Deposit
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 rounded">
                  Refunded post-trip
                </span>
              </span>
              <span className="font-semibold text-slate-800">
                ₹{securityDeposit.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-sm font-extrabold text-slate-900">
              <span>Estimated Grand Total</span>
              <span className="text-emerald-700 text-base">
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Demo Identity Notice */}
          <div className="text-[11px] text-slate-500 bg-amber-50/70 border border-amber-200/60 p-2.5 rounded-xl flex items-start gap-2">
            <UserCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              Booking will be submitted under customer:{' '}
              <strong className="text-slate-800">{currentUser?.name || 'Customer'}</strong> (
              {currentUser?.email || 'customer@vahanloop.demo'}). You can switch roles to review it as the Owner.
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-colors flex items-center gap-1.5"
            >
              {isSubmitting ? 'Submitting Request...' : 'Send Booking Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
