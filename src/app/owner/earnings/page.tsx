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
    <div className="space-y-8 pb-16">
      <OwnerNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="pb-6 border-b border-brand-border">
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-brand-navy">
            Partner Revenue & Settlements
          </h1>
          <p className="text-xs sm:text-sm text-brand-text-muted mt-1">
            Simulated demonstration payout ledger for host{' '}
            <strong className="text-brand-navy">{currentUser?.name || 'Partner'}</strong>.
          </p>
        </div>

        {/* Sandbox Notice */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Demonstration Ledger:</strong> In this prototype, all financial values and payouts are
            simulated. No real bank accounts or escrow services are connected.
          </div>
        </div>

        {/* Revenue Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-brand-border shadow-card space-y-2">
            <div className="flex items-center justify-between text-brand-text-muted">
              <span className="text-xs font-bold uppercase tracking-wider">Gross Trip Value</span>
              <TrendingUp className="w-4 h-4 text-brand-navy" />
            </div>
            <p className="text-3xl font-display font-black text-brand-navy">
              ₹{grossBookingValue.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-brand-text-muted">Total customer trip spend</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-brand-border shadow-card space-y-2">
            <div className="flex items-center justify-between text-brand-text-muted">
              <span className="text-xs font-bold uppercase tracking-wider">Platform Fee (10%)</span>
              <ArrowDownRight className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-3xl font-display font-black text-blue-600">
              ₹{totalCommission.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-brand-text-muted">VahanLoop marketplace commission</p>
          </div>

          <div className="bg-brand-emerald-subtle p-6 rounded-3xl border border-brand-emerald/20 shadow-card space-y-2">
            <div className="flex items-center justify-between text-brand-emerald">
              <span className="text-xs font-bold uppercase tracking-wider">Net Partner Payout</span>
              <Wallet className="w-4 h-4 text-brand-emerald" />
            </div>
            <p className="text-3xl font-display font-black text-brand-emerald">
              ₹{netEarnings.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-brand-emerald font-medium">Ready for simulated settlement</p>
          </div>
        </div>

        {/* Transaction History Table */}
        <div className="bg-white rounded-3xl border border-brand-border shadow-card p-7 space-y-5">
          <h2 className="text-lg font-display font-bold text-brand-navy">Settlement Ledger (Simulated)</h2>

          {confirmedOrCompleted.length > 0 ? (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-brand-border text-brand-text-muted uppercase tracking-wider text-[10px]">
                    <th className="pb-3 font-bold">Booking ID</th>
                    <th className="pb-3 font-bold">Vehicle</th>
                    <th className="pb-3 font-bold">Guest</th>
                    <th className="pb-3 font-bold">Dates</th>
                    <th className="pb-3 font-bold">Gross</th>
                    <th className="pb-3 font-bold">Commission</th>
                    <th className="pb-3 text-right font-bold">Net Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  {confirmedOrCompleted.map((b) => (
                    <tr key={b.id} className="hover:bg-brand-surface/50 transition-colors">
                      <td className="py-3 font-mono text-[10px] text-brand-text-muted">{b.id}</td>
                      <td className="py-3 font-semibold text-brand-navy">{b.vehicleTitle}</td>
                      <td className="py-3 text-brand-text-muted">{b.customerName}</td>
                      <td className="py-3 text-brand-text-muted">
                        {b.startDate} → {b.endDate}
                      </td>
                      <td className="py-3 text-brand-navy font-semibold">₹{b.totalAmount.toLocaleString('en-IN')}</td>
                      <td className="py-3 text-blue-600 font-semibold">₹{b.platformCommission.toLocaleString('en-IN')}</td>
                      <td className="py-3 text-right font-bold text-brand-emerald text-sm">
                        ₹{b.ownerEarnings.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-10 text-center text-xs text-brand-text-muted">
              No confirmed bookings yet. Payouts will appear once guests complete reservation payments.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
