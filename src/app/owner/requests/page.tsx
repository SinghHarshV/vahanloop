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
  User,
  IndianRupee,
  Car,
  Check,
  X,
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
    <div className="space-y-6 pb-16">
      <OwnerNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Booking Requests & Approvals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review guest reservation requests, verify dates, and accept to allow customers to
            simulate checkout.
          </p>
        </div>

        <div className="space-y-4">
          {ownerBookings.length > 0 ? (
            ownerBookings.map((bk) => {
              const isPending = bk.status === 'requested';
              const isAwaitingPayment = bk.status === 'awaiting_payment';
              const isConfirmed = bk.status === 'confirmed';
              const isRejected = bk.status === 'rejected';

              return (
                <div
                  key={bk.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400">ID: {bk.id}</span>
                      <h3 className="text-base font-bold text-slate-900">{bk.vehicleTitle}</h3>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        isConfirmed
                          ? 'bg-emerald-100 text-emerald-800'
                          : isAwaitingPayment
                          ? 'bg-blue-100 text-blue-800'
                          : isPending
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : isRejected
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {bk.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                    {/* Customer Info */}
                    <div className="space-y-1">
                      <p className="text-slate-400 font-medium">Guest Profile</p>
                      <p className="font-bold text-slate-800">{bk.customerName}</p>
                      <p className="text-slate-500">{bk.customerEmail}</p>
                      <p className="text-slate-500">{bk.customerPhone || '+91 98765 43210'}</p>
                    </div>

                    {/* Schedule */}
                    <div className="space-y-1">
                      <p className="text-slate-400 font-medium">Trip Window</p>
                      <p className="font-bold text-slate-800">
                        {bk.startDate} &rarr; {bk.endDate}
                      </p>
                      <p className="text-slate-500">
                        Duration: {bk.totalDays} {bk.totalDays === 1 ? 'day' : 'days'}
                      </p>
                      <p className="text-slate-600 capitalize">
                        Mode: {bk.rentalType.replace('-', ' ')}
                      </p>
                    </div>

                    {/* Financials */}
                    <div className="space-y-1">
                      <p className="text-slate-400 font-medium">Simulated Partner Revenue</p>
                      <p className="text-base font-black text-slate-900">
                        ₹{bk.ownerEarnings.toLocaleString('en-IN')}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Gross: ₹{bk.totalAmount} (Comm: ₹{bk.platformCommission})
                      </p>
                    </div>

                    {/* Action Controls */}
                    <div className="flex flex-col justify-center items-start md:items-end">
                      {isPending && (
                        <div className="flex gap-2 w-full md:w-auto">
                          <button
                            onClick={() => handleAccept(bk.id)}
                            className="flex-1 md:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm text-xs transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Accept Request
                          </button>
                          <button
                            onClick={() => setRejectingBookingId(bk.id)}
                            className="flex-1 md:flex-initial px-3 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            Decline
                          </button>
                        </div>
                      )}

                      {isAwaitingPayment && (
                        <p className="text-xs text-blue-700 font-semibold bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
                          Accepted. Awaiting customer payment simulation.
                        </p>
                      )}

                      {isConfirmed && (
                        <p className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Payment Confirmed
                        </p>
                      )}

                      {isRejected && (
                        <p className="text-xs text-rose-700 font-semibold bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                          Declined: {bk.rejectionReason || 'Unavailable'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Inline Rejection Reason Box */}
                  {rejectingBookingId === bk.id && (
                    <div className="mt-3 p-3 bg-rose-50 rounded-xl border border-rose-200 space-y-2 text-xs">
                      <label className="block font-bold text-rose-900">
                        Reason for declining request:
                      </label>
                      <input
                        type="text"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-rose-300 bg-white"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleConfirmReject(bk.id)}
                          className="px-3 py-1 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700"
                        >
                          Confirm Decline
                        </button>
                        <button
                          onClick={() => setRejectingBookingId(null)}
                          className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg font-medium"
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
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-400">
              No booking requests received yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
