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
  MapPin,
  ShieldCheck,
  ChevronRight,
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
          bg: 'bg-brand-emerald-subtle text-brand-emerald border-brand-emerald/30',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          label: 'Confirmed Booking',
        };
      case 'awaiting_payment':
        return {
          bg: 'bg-blue-500/10 text-blue-700 border-blue-500/30 animate-pulse',
          icon: <CreditCard className="w-3.5 h-3.5" />,
          label: 'Accepted · Ready for Payment',
        };
      case 'requested':
        return {
          bg: 'bg-amber-500/10 text-amber-700 border-amber-500/30',
          icon: <Clock className="w-3.5 h-3.5" />,
          label: 'Requested · Awaiting Host',
        };
      case 'rejected':
        return {
          bg: 'bg-brand-danger/10 text-brand-danger border-brand-danger/30',
          icon: <XCircle className="w-3.5 h-3.5" />,
          label: 'Host Declined',
        };
      case 'cancelled':
        return {
          bg: 'bg-slate-100 text-brand-text-muted border-brand-border',
          icon: <AlertCircle className="w-3.5 h-3.5" />,
          label: 'Cancelled',
        };
      case 'completed':
        return {
          bg: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/30',
          icon: <FileCheck2 className="w-3.5 h-3.5" />,
          label: 'Completed Trip',
        };
      case 'active':
        return {
          bg: 'bg-brand-emerald-subtle text-brand-emerald border-brand-emerald/30',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          label: 'Active On-Road',
        };
      case 'expired':
        return {
          bg: 'bg-slate-100 text-brand-text-muted border-brand-border',
          icon: <Clock className="w-3.5 h-3.5" />,
          label: 'Hold Expired',
        };
      default:
        return {
          bg: 'bg-brand-surface text-brand-navy border-brand-border',
          icon: <Clock className="w-3.5 h-3.5" />,
          label: String(status),
        };
    }
  };

  const badge = getStatusBadge(booking.status);

  return (
    <div className="bg-white rounded-3xl border border-brand-border shadow-card hover:shadow-card-hover transition-all duration-300 p-6 space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-brand-border pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase font-bold text-brand-text-muted">
            Reservation #{booking.id}
          </span>
          <h3 className="text-lg font-display font-bold text-brand-navy mt-0.5">
            {booking.vehicleTitle}
          </h3>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}
        >
          {badge.icon}
          <span>{badge.label}</span>
        </span>
      </div>

      {/* Middle Specs & Details */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-3 bg-brand-surface rounded-2xl border border-brand-border/60">
          <p className="text-[10px] font-bold uppercase text-brand-text-muted">Trip Dates</p>
          <div className="flex items-center gap-1.5 font-bold text-brand-navy mt-1">
            <Calendar className="w-3.5 h-3.5 text-brand-emerald" />
            <span>
              {booking.startDate} &rarr; {booking.endDate}
            </span>
          </div>
          <p className="text-[10px] text-brand-text-muted mt-0.5">
            {booking.totalDays} {booking.totalDays === 1 ? 'day' : 'days'} duration
          </p>
        </div>

        <div className="p-3 bg-brand-surface rounded-2xl border border-brand-border/60">
          <p className="text-[10px] font-bold uppercase text-brand-text-muted">Rental Mode</p>
          <p className="font-bold text-brand-navy capitalize mt-1 text-sm">
            {booking.rentalType.replace('-', ' ')}
          </p>
          <p className="text-[10px] text-brand-text-muted mt-0.5">Category: {booking.vehicleCategory}</p>
        </div>

        <div className="p-3 bg-brand-surface rounded-2xl border border-brand-border/60">
          <p className="text-[10px] font-bold uppercase text-brand-text-muted">Total Amount</p>
          <p className="font-display font-extrabold text-brand-navy text-base mt-1">
            ₹{booking.totalAmount.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-brand-text-muted mt-0.5">Incl. deposit & platform fees</p>
        </div>

        <div className="p-3 bg-brand-surface rounded-2xl border border-brand-border/60">
          <p className="text-[10px] font-bold uppercase text-brand-text-muted">Payment Status</p>
          <p className="font-bold text-brand-navy capitalize mt-1 text-sm">
            {booking.paymentSimulated ? 'Paid (Sandbox)' : 'Pending'}
          </p>
          <p className="text-[10px] text-brand-text-muted mt-0.5">
            {booking.paymentSimulated?.method || 'Not yet processed'}
          </p>
        </div>
      </div>

      {/* Action Strip */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-brand-text-muted">
          <ShieldCheck className="w-4 h-4 text-brand-emerald" />
          <span>Vehicle host: {booking.customerEmail ? 'Verified Partner' : 'Direct Host'}</span>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {booking.status === 'awaiting_payment' && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-bold bg-brand-emerald hover:bg-brand-emerald-dark text-white shadow-floating flex items-center justify-center gap-1.5 transition-all"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Complete Test Payment
            </button>
          )}

          {booking.status === 'requested' && (
            <button
              onClick={() => updateBookingStatus(booking.id, 'cancelled')}
              className="px-4 py-2 rounded-full text-xs font-semibold text-brand-danger bg-brand-danger/10 hover:bg-brand-danger/20 transition-colors"
            >
              Cancel Request
            </button>
          )}
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal
          booking={booking}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            setShowPaymentModal(false);
          }}
        />
      )}
    </div>
  );
};
