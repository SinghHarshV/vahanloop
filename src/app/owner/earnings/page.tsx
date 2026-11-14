'use client';

import React from 'react';
import { useMarketplace } from '@/context/MarketplaceContext';
import { useAuth } from '@/context/AuthContext';
import { OwnerNav } from '@/components/owner/OwnerNav';
import { IndianRupee, TrendingUp, ShieldCheck, ArrowDownRight, Wallet } from 'lucide-react';

export default function OwnerEarningsPage() {
  const { bookings } = useMarketplace();
  const { currentUser } = useAuth();

  const ownerBookings = currentUser
    ? bookings.filter((b) => b.ownerId === currentUser.id)
    : [];

  const confirmedOrCompleted = ownerBookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'completed'
  );

  const grossBookingValue = confirmedOrCompleted.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalCommission = confirmedOrCompleted.reduce(
    (acc, curr) => acc + curr.platformCommission,
    0
  );
  const netEarnings = confirmedOrCompleted.reduce((acc, curr) => acc + curr.ownerEarnings, 0);

  return (
    <div className="space-y-6 pb-16">
      <OwnerNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Partner Revenue & Settlements
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Simulated demonstration payout ledger for host{' '}
            <strong className="text-slate-800">{currentUser?.name || 'Partner'}</strong>.
          </p>
        </div>

        {/* Sandbox Notice */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Demonstration Ledger:</strong> In this MVP prototype, all financial values and
            payouts are simulated demonstration figures. No real bank accounts or escrow services
            are integrated.
          </div>
        </div>

        {/* Revenue Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Gross Booking Value</span>
              <TrendingUp className="w-4 h-4 text-slate-600" />
            </div>
            <p className="text-3xl font-black text-slate-900">
              ₹{grossBookingValue.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-400">Total customer trip spend</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Platform Take (10%)</span>
              <ArrowDownRight className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-3xl font-black text-blue-700">
              ₹{totalCommission.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-400">VahanLoop service & insurance fee</p>
          </div>

          <div className="bg-emerald-50/60 p-6 rounded-3xl border border-emerald-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-emerald-800">
              <span className="text-xs font-bold uppercase tracking-wider">Net Partner Payout</span>
              <Wallet className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-3xl font-black text-emerald-700">
              ₹{netEarnings.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-emerald-600 font-medium">Ready for simulated settlement</p>
          </div>
        </div>

        {/* Transaction History Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900">Settlement Ledger (Simulated)</h2>

          {confirmedOrCompleted.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="pb-3">Booking ID</th>
                    <th className="pb-3">Vehicle</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Dates</th>
                    <th className="pb-3">Gross</th>
                    <th className="pb-3">Commission</th>
                    <th className="pb-3 text-right">Net Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {confirmedOrCompleted.map((b) => (
                    <tr key={b.id} className="py-2.5">
                      <td className="py-3 font-mono text-[11px] text-slate-500">{b.id}</td>
                      <td className="py-3 font-semibold text-slate-800">{b.vehicleTitle}</td>
                      <td className="py-3 text-slate-600">{b.customerName}</td>
                      <td className="py-3 text-slate-500">
                        {b.startDate} to {b.endDate}
                      </td>
                      <td className="py-3 text-slate-600">₹{b.totalAmount}</td>
                      <td className="py-3 text-blue-600">₹{b.platformCommission}</td>
                      <td className="py-3 text-right font-bold text-emerald-700">
                        ₹{b.ownerEarnings}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No confirmed bookings yet. Payouts will appear once guests complete reservation
              payments.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
