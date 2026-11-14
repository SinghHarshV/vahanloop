'use client';

import React, { useState } from 'react';
import { Booking, BookingStatus } from '@/types';
import { PaymentModal } from './PaymentModal';
import { useMarketplace } from '@/context/MarketplaceContext';
import {
  Calendar,
  Clock,
  Car,
  CheckCircle2,
  AlertCircle,
  XCircle,
  CreditCard,
  FileCheck2,
  Sparkles,
} from 'lucide-react';

interface BookingCardProps {
  booking: Booking;
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking }) => {
  const { updateBookingStatus } = useMarketplace();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          label: 'Confirmed Reservation',
        };
      case 'awaiting_payment':
        return {
          bg: 'bg-blue-100 text-blue-800 border-blue-300 animate-pulse',
          icon: <CreditCard className="w-3.5 h-3.5" />,
          label: 'Accepted – Awaiting Payment',
        };
      case 'requested':
        return {
          bg: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: <Clock className="w-3.5 h-3.5" />,
          label: 'Requested – Awaiting Partner',
        };
      case 'rejected':
        return {
          bg: 'bg-rose-100 text-rose-800 border-rose-300',
          icon: <XCircle className="w-3.5 h-3.5" />,
          label: 'Partner Declined',
        };
      case 'cancelled':
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          icon: <AlertCircle className="w-3.5 h-3.5" />,
          label: 'Cancelled',
        };
      case 'completed':
        return {
          bg: 'bg-indigo-100 text-indigo-800 border-indigo-300',
          icon: <FileCheck2 className="w-3.5 h-3.5" />,
          label: 'Completed Trip',
        };
    }
  };

  const badge = getStatusBadge(booking.status);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <span className="text-[11px] font-mono text-slate-400">ID: {booking.id}</span>
          <h3 className="text-base font-bold text-slate-900 mt-0.5">{booking.vehicleTitle}</h3>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}
        >
          {badge.icon}
          {badge.label}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
        {/* Thumbnail */}
        <div className="w-full md:w-36 h-24 rounded-xl overflow-hidden bg-slate-100 relative shrink-0">
          {booking.vehicleImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={booking.vehicleImage}
              alt={booking.vehicleTitle}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <Car className="w-8 h-8" />
            </div>
          )}
        </div>

        {/* Schedule & Mode */}
        <div className="space-y-1.5 text-xs text-slate-600 md:col-span-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold text-slate-800">
              {booking.startDate} &rarr; {booking.endDate} ({booking.totalDays}{' '}
              {booking.totalDays === 1 ? 'day' : 'days'})
            </span>
          </div>

          <p className="capitalize">
            <strong className="text-slate-700">Mode:</strong>{' '}
            {booking.rentalType.replace('-', ' ')}
            {booking.driverChargeTotal > 0 && ' (With Professional Chauffeur)'}
          </p>

          <p className="text-[11px] text-slate-400">
            Requested on {new Date(booking.createdAt).toLocaleDateString()}
          </p>

          {booking.rejectionReason && (
            <p className="text-rose-600 text-xs bg-rose-50 p-2 rounded-lg border border-rose-200 mt-1">
              <strong>Decline Reason:</strong> {booking.rejectionReason}
            </p>
          )}

          {booking.paymentSimulated && (
            <div className="bg-emerald-50 border border-emerald-200/80 p-2 rounded-lg text-[11px] text-emerald-800 flex items-center gap-2 mt-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                <strong>Simulated Receipt:</strong> {booking.paymentSimulated.transactionId} via{' '}
                {booking.paymentSimulated.method}
              </span>
            </div>
          )}
        </div>

        {/* Price & Action */}
        <div className="flex flex-col justify-between items-start md:items-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
          <div className="text-left md:text-right">
            <p className="text-xs text-slate-400">Total Simulation Price</p>
            <p className="text-lg font-black text-slate-900">
              ₹{booking.totalAmount.toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-slate-400">Incl. ₹{booking.securityDeposit} deposit</p>
          </div>

          <div className="mt-3 flex gap-2">
            {booking.status === 'awaiting_payment' && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-4 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" />
                Simulate Payment
              </button>
            )}

            {(booking.status === 'requested' || booking.status === 'awaiting_payment') && (
              <button
                onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              >
                Cancel Request
              </button>
            )}
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal
          booking={booking}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
};
