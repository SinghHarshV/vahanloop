'use client';

import React, { useState } from 'react';
import { useMarketplace } from '@/context/MarketplaceContext';
import { AdminNav } from '@/components/admin/AdminNav';
import { Booking, BookingStatus } from '@/types';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  XCircle,
  CreditCard,
  FileCheck2,
  AlertTriangle,
  X,
  Eye,
} from 'lucide-react';

export default function AdminBookingsPage() {
  const { bookings, updateBookingStatus } = useMarketplace();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const filtered = bookings.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    return true;
  });

  const handleCancelBooking = (id: string) => {
    updateBookingStatus(id, 'cancelled');
    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking(null);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Marketplace Booking Ledger
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Supervise all platform reservations, inspect transactions, and cancel invalid bookings.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800"
            >
              <option value="all">All Statuses</option>
              <option value="requested">Requested</option>
              <option value="awaiting_payment">Awaiting Payment</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Booking ID</th>
                  <th className="py-3 px-4">Vehicle Title</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Trip Dates</th>
                  <th className="py-3 px-4">Gross Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{b.id}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{b.vehicleTitle}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{b.customerName}</p>
                      <p className="text-[11px] text-slate-400">{b.customerEmail}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {b.startDate} &rarr; {b.endDate} ({b.totalDays}d)
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      ₹{b.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          b.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'awaiting_payment'
                            ? 'bg-blue-100 text-blue-800'
                            : b.status === 'requested'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {b.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="px-3 py-1 bg-purple-50 text-purple-800 hover:bg-purple-100 font-semibold rounded-lg text-xs"
                      >
                        Inspect
                      </button>
                      {b.status !== 'cancelled' && (
                        <button
                          onClick={() => handleCancelBooking(b.id)}
                          className="px-2.5 py-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Booking Inspector Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 relative text-xs space-y-4">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="font-mono text-slate-400 text-[10px]">
                ID: {selectedBooking.id}
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                {selectedBooking.vehicleTitle}
              </h3>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Renter:</span>
                <span className="font-semibold text-slate-800">
                  {selectedBooking.customerName} ({selectedBooking.customerEmail})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Trip Dates:</span>
                <span className="font-semibold text-slate-800">
                  {selectedBooking.startDate} to {selectedBooking.endDate} (
                  {selectedBooking.totalDays} days)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Rental Mode:</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {selectedBooking.rentalType.replace('-', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Daily Rate:</span>
                <span className="font-semibold text-slate-800">
                  ₹{selectedBooking.dailyRate}/day
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Deposit:</span>
                <span className="font-semibold text-slate-800">
                  ₹{selectedBooking.securityDeposit}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-sm text-slate-900">
                <span>Grand Total:</span>
                <span className="text-emerald-700">₹{selectedBooking.totalAmount}</span>
              </div>
            </div>

            {selectedBooking.paymentSimulated && (
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-800 space-y-1">
                <p className="font-bold">Simulated Payment Record</p>
                <p>Transaction ID: {selectedBooking.paymentSimulated.transactionId}</p>
                <p>Method: {selectedBooking.paymentSimulated.method}</p>
                <p>Paid At: {new Date(selectedBooking.paymentSimulated.paidAt).toLocaleString()}</p>
              </div>
            )}

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
              >
                Close
              </button>
              {selectedBooking.status !== 'cancelled' && (
                <button
                  onClick={() => handleCancelBooking(selectedBooking.id)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
