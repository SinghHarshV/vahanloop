'use client';

import React, { useState } from 'react';
import { useMarketplace } from '@/context/MarketplaceContext';
import { useAuth } from '@/context/AuthContext';
import { OwnerNav } from '@/components/owner/OwnerNav';
import {
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  IndianRupee,
  Car,
  Check,
  X,
  User,
} from 'lucide-react';

export default function BookingRequestsPage() {
  const { bookings, updateBookingStatus } = useMarketplace();
  const { currentUser } = useAuth();

  const [rejectingBookingId, setRejectingBookingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Vehicle unavailable on requested dates.');

  const ownerBookings = currentUser
    ? bookings.filter((b) => b.ownerId === currentUser.id)
    : [];

  const handleAccept = (id: string) => {
    updateBookingStatus(id, 'awaiting_payment');
  };

  const handleConfirmReject = (id: string) => {
    updateBookingStatus(id, 'rejected', undefined, rejectReason);
    setRejectingBookingId(null);
  };

  return (
    <div className="space-y-8 pb-16">
      <OwnerNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="pb-6 border-b border-brand-border">
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-brand-navy">
            Booking Requests & Approvals
          </h1>
          <p className="text-xs sm:text-sm text-brand-text-muted mt-1">
            Review guest reservation requests, verify dates, and accept to allow customers to complete checkout.
          </p>
        </div>

        <div className="space-y-5">
          {ownerBookings.length > 0 ? (
            ownerBookings.map((bk) => {
              const isPending = bk.status === 'requested';
              const isAwaitingPayment = bk.status === 'awaiting_payment';
              const isConfirmed = bk.status === 'confirmed';
              const isRejected = bk.status === 'rejected';

              return (
                <div
                  key={bk.id}
                  className="bg-white rounded-3xl border border-brand-border shadow-card hover:shadow-card-hover transition-all p-6 space-y-5"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-brand-border pb-4">
                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold text-brand-text-muted">
                        Reservation #{bk.id}
                      </span>
                      <h3 className="text-lg font-display font-bold text-brand-navy mt-0.5">{bk.vehicleTitle}</h3>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                        isConfirmed
                          ? 'bg-brand-emerald-subtle text-brand-emerald border-brand-emerald/20'
                          : isAwaitingPayment
                          ? 'bg-blue-500/10 text-blue-700 border-blue-500/20 animate-pulse'
                          : isPending
                          ? 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                          : 'bg-brand-danger/10 text-brand-danger border-brand-danger/20'
                      }`}
                    >
                      {isConfirmed && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {isPending && <Clock className="w-3.5 h-3.5" />}
                      {isRejected && <XCircle className="w-3.5 h-3.5" />}
                      <span>{bk.status.replace(/_/g, ' ')}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    {/* Customer Info */}
                    <div className="p-3.5 bg-brand-surface rounded-2xl border border-brand-border/60 space-y-1">
                      <p className="text-[10px] font-bold uppercase text-brand-text-muted">Guest</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="w-7 h-7 rounded-xl bg-brand-navy text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {bk.customerName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-brand-navy text-sm leading-tight">{bk.customerName}</p>
                          <p className="text-brand-text-muted text-[10px]">{bk.customerEmail}</p>
                        </div>
                      </div>
                      <p className="text-brand-text-muted mt-1">{bk.customerPhone || '+91 98765 43210'}</p>
                    </div>

                    {/* Schedule */}
                    <div className="p-3.5 bg-brand-surface rounded-2xl border border-brand-border/60 space-y-1">
                      <p className="text-[10px] font-bold uppercase text-brand-text-muted">Trip Window</p>
                      <p className="font-bold text-brand-navy text-sm mt-1">
                        {bk.startDate} → {bk.endDate}
                      </p>
                      <p className="text-brand-text-muted">
                        {bk.totalDays} {bk.totalDays === 1 ? 'day' : 'days'} · {bk.rentalType.replace('-', ' ')}
                      </p>
                    </div>

                    {/* Financials */}
                    <div className="p-3.5 bg-brand-surface rounded-2xl border border-brand-border/60 space-y-1">
                      <p className="text-[10px] font-bold uppercase text-brand-text-muted">Your Revenue</p>
                      <p className="text-xl font-display font-black text-brand-navy mt-1">
                        ₹{bk.ownerEarnings.toLocaleString('en-IN')}
                      </p>
                      <p className="text-[10px] text-brand-text-muted">
                        Gross: ₹{bk.totalAmount.toLocaleString('en-IN')} · Platform fee: ₹{bk.platformCommission.toLocaleString('en-IN')}
                      </p>
                    </div>

                    {/* Action Controls */}
                    <div className="flex flex-col justify-center gap-2">
                      {isPending && (
                        <>
                          <button
                            onClick={() => handleAccept(bk.id)}
                            className="w-full px-4 py-2.5 bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold rounded-full text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Accept Request
                          </button>
                          <button
                            onClick={() => setRejectingBookingId(bk.id)}
                            className="w-full px-3 py-2 bg-brand-surface hover:bg-brand-danger/10 hover:text-brand-danger text-brand-text-muted font-semibold rounded-full text-xs border border-brand-border transition-all flex items-center justify-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            Decline
                          </button>
                        </>
                      )}

                      {isAwaitingPayment && (
                        <p className="text-xs text-blue-700 font-semibold bg-blue-500/10 px-3 py-2 rounded-xl border border-blue-500/20 text-center">
                          Accepted · Awaiting customer payment
                        </p>
                      )}

                      {isConfirmed && (
                        <p className="text-xs text-brand-emerald font-semibold bg-brand-emerald-subtle px-3 py-2 rounded-xl border border-brand-emerald/20 flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Payment Confirmed
                        </p>
                      )}

                      {isRejected && (
                        <p className="text-xs text-brand-danger font-semibold bg-brand-danger/10 px-3 py-2 rounded-xl border border-brand-danger/20 text-center">
                          Declined: {bk.rejectionReason || 'Unavailable'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Inline Rejection Reason Box */}
                  {rejectingBookingId === bk.id && (
                    <div className="mt-3 p-4 bg-brand-danger/5 rounded-2xl border border-brand-danger/20 space-y-3 text-xs">
                      <label className="block font-bold text-brand-navy">
                        Reason for declining this request:
                      </label>
                      <input
                        type="text"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-brand-border bg-white text-brand-navy text-xs focus:outline-none focus:ring-2 focus:ring-brand-danger"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleConfirmReject(bk.id)}
                          className="px-4 py-1.5 bg-brand-danger text-white rounded-full font-bold text-xs hover:bg-red-700"
                        >
                          Confirm Decline
                        </button>
                        <button
                          onClick={() => setRejectingBookingId(null)}
                          className="px-4 py-1.5 bg-brand-surface text-brand-text rounded-full font-semibold text-xs border border-brand-border"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-3xl border border-brand-border p-12 text-center shadow-card space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-brand-surface flex items-center justify-center mx-auto">
                <Inbox className="w-7 h-7 text-brand-text-muted stroke-[1.5]" />
              </div>
              <h3 className="font-display font-bold text-brand-navy">No booking requests yet</h3>
              <p className="text-xs text-brand-text-muted">Guest requests will appear here when customers book your vehicles.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
