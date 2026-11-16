'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMarketplace, ApiVehicle } from '@/context/MarketplaceContext';
import { useAuth } from '@/context/AuthContext';
import { AdminNav } from '@/components/admin/AdminNav';
import {
  ShieldCheck,
  Users,
  Car,
  CheckCircle2,
  Clock,
  CalendarDays,
  IndianRupee,
  ArrowRight,
  Eye,
  Check,
} from 'lucide-react';

function statusBadge(status: string) {
  switch (status) {
    case 'CONFIRMED': return 'bg-brand-emerald-accent text-brand-emerald';
    case 'AWAITING_PAYMENT': return 'bg-blue-100 text-blue-700';
    case 'REQUESTED': return 'bg-amber-100 text-amber-800';
    case 'CANCELLED': return 'bg-red-100 text-brand-danger';
    default: return 'bg-brand-surface text-brand-text-muted';
  }
}

export default function AdminOverviewPage() {
  const { vehicles, bookings, updateVehicleApproval } = useMarketplace();
  const { currentUser } = useAuth();
  const [reviewing, setReviewing] = useState<ApiVehicle | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const pendingVehicles = vehicles.filter(
    (v) => (v.approvalStatus as string).toLowerCase() === 'pending'
  );
  const approvedVehicles = vehicles.filter(
    (v) => (v.approvalStatus as string).toLowerCase() === 'approved'
  );
  const grossBookingValue = bookings.reduce((acc, b) => acc + b.totalAmount, 0);

  const handleQuickApprove = async (id: string) => {
    await updateVehicleApproval(id, 'approve');
  };

  const handleReject = async (id: string) => {
    await updateVehicleApproval(id, 'reject', rejectReason || 'Requirements not met');
    setReviewing(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-8 pb-16">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Banner */}
        <div className="bg-brand-navy text-white rounded-3xl p-8 sm:p-10 shadow-floating border border-brand-navy-light/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/20 backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-emerald" />
              <span>Platform Administration & Compliance</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight">
              Administrator Command Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Oversee marketplace operations, verify host vehicle listings, and supervise customer reservations.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-xs">
            <span className="text-slate-300 font-medium">Logged in as:</span>{' '}
            <strong className="text-white">{currentUser?.fullName ?? 'Admin'}</strong>
          </div>
        </div>

        {/* 6 Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-3xl border border-brand-border shadow-card space-y-1">
            <div className="flex items-center justify-between text-brand-text-muted">
              <span className="text-[10px] font-bold uppercase tracking-wider">Platform Users</span>
              <Users className="w-4 h-4" />
            </div>
            <p className="text-xl font-display font-black text-brand-navy">3+</p>
            <p className="text-[10px] text-brand-text-muted">Registered</p>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-brand-border shadow-card space-y-1">
            <div className="flex items-center justify-between text-brand-text-muted">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Vehicles</span>
              <Car className="w-4 h-4" />
            </div>
            <p className="text-xl font-display font-black text-brand-navy">{vehicles.length}</p>
            <p className="text-[10px] text-brand-text-muted">Catalogue size</p>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-brand-border shadow-card space-y-1">
            <div className="flex items-center justify-between text-brand-text-muted">
              <span className="text-[10px] font-bold uppercase tracking-wider">Approved</span>
              <CheckCircle2 className="w-4 h-4 text-brand-emerald" />
            </div>
            <p className="text-xl font-display font-black text-brand-emerald">{approvedVehicles.length}</p>
            <p className="text-[10px] text-brand-text-muted">Live in search</p>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-brand-border shadow-card space-y-1">
            <div className="flex items-center justify-between text-brand-text-muted">
              <span className="text-[10px] font-bold uppercase tracking-wider">Pending Review</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-xl font-display font-black text-amber-600">{pendingVehicles.length}</p>
            <p className="text-[10px] text-brand-text-muted">Requires review</p>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-brand-border shadow-card space-y-1">
            <div className="flex items-center justify-between text-brand-text-muted">
              <span className="text-[10px] font-bold uppercase tracking-wider">Bookings</span>
              <CalendarDays className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-xl font-display font-black text-brand-navy">{bookings.length}</p>
            <p className="text-[10px] text-brand-text-muted">Platform orders</p>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-brand-border shadow-card space-y-1">
            <div className="flex items-center justify-between text-brand-text-muted">
              <span className="text-[10px] font-bold uppercase tracking-wider">Gross Spend</span>
              <IndianRupee className="w-4 h-4 text-brand-emerald" />
            </div>
            <p className="text-xl font-display font-black text-brand-navy">₹{(grossBookingValue / 1000).toFixed(1)}k</p>
            <p className="text-[10px] text-brand-text-muted">Simulated GBV</p>
          </div>
        </div>

        {/* Operations Hub Shortcut */}
        <div className="bg-brand-surface rounded-3xl border border-brand-border p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-emerald-subtle text-brand-emerald flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-brand-navy text-sm">
                Pilot Operations, Compliance &amp; Verification Hub
              </h3>
              <p className="text-xs text-brand-text-muted">
                Inspect owner KYC applications, configure state transport rules, review document expiries, and monitor road safety incidents.
              </p>
            </div>
          </div>
          <Link
            href="/admin/operations"
            className="px-4 py-2 bg-brand-navy hover:bg-brand-navy-light text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5 shrink-0"
          >
            <span>Open Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Pending Vehicle Reviews Queue */}
        <div className="bg-white rounded-3xl border border-brand-border shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-display font-bold text-brand-navy">
                Pending Vehicle Approvals ({pendingVehicles.length})
              </h2>
              <p className="text-xs text-brand-text-muted">
                Newly submitted partner vehicles awaiting administrator verification.
              </p>
            </div>
            <Link href="/admin/vehicles" className="text-xs font-bold text-brand-emerald hover:underline flex items-center gap-1">
              All Listings <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {pendingVehicles.length > 0 ? (
            <div className="divide-y divide-brand-border/60">
              {pendingVehicles.map((v) => (
                <div key={v.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="font-mono text-brand-text-muted text-[10px]">{v.id}</span>
                    <h4 className="text-sm font-bold text-brand-navy">{v.make} {v.model} ({v.manufacturingYear})</h4>
                    <p className="text-brand-text-muted">
                      Host: <strong>{v.owner?.fullName ?? 'Unknown'}</strong> · {v.location}
                    </p>
                    <p className="text-brand-text-muted">
                      Category: <span className="capitalize">{v.category.toLowerCase()}</span> ·
                      Rate: ₹{v.dailyRentalPrice}/day
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setReviewing(v)}
                      className="px-3.5 py-1.5 rounded-xl font-bold bg-brand-surface hover:bg-slate-200/60 text-brand-navy border border-brand-border transition-colors flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Inspect &amp; Review
                    </button>
                    <button
                      onClick={() => handleQuickApprove(v.id)}
                      className="px-3.5 py-1.5 rounded-xl font-bold bg-brand-emerald text-white hover:bg-brand-emerald-dark shadow-sm transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Quick Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-brand-text-muted">
              All vehicles are reviewed. Zero pending approvals in the queue!
            </div>
          )}
        </div>

        {/* Recent Platform Bookings */}
        <div className="bg-white rounded-3xl border border-brand-border shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-display font-bold text-brand-navy">Recent Marketplace Bookings</h2>
              <p className="text-xs text-brand-text-muted">Live reservations across all customers and hosts.</p>
            </div>
            <Link href="/admin/bookings" className="text-xs font-bold text-brand-emerald hover:underline flex items-center gap-1">
              Manage all bookings <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-brand-border text-brand-text-muted uppercase tracking-wider text-[10px]">
                  <th className="pb-3">Booking ID</th>
                  <th className="pb-3">Vehicle</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Dates</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {bookings.slice(0, 5).map((b) => (
                  <tr key={b.id} className="py-2.5">
                    <td className="py-3 font-mono text-[11px] text-brand-text-muted">{b.id.slice(0, 12)}…</td>
                    <td className="py-3 font-semibold text-brand-navy">
                      {b.vehicle ? `${b.vehicle.make} ${b.vehicle.model}` : b.vehicleId}
                    </td>
                    <td className="py-3 text-brand-text-muted">{b.customer?.fullName ?? b.customerId}</td>
                    <td className="py-3 text-brand-text-muted">
                      {new Date(b.pickupDateTime || b.startDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short' })} →{' '}
                      {new Date(b.returnDateTime || b.endDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short' })}
                    </td>
                    <td className="py-3 font-bold text-brand-navy">₹{b.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="py-3 text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusBadge(b.status)}`}>
                        {b.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Inline Review Modal */}
      {reviewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-floating max-w-lg w-full p-6 space-y-4 border border-brand-border">
            <h3 className="text-lg font-display font-bold text-brand-navy">Review: {reviewing.make} {reviewing.model}</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-brand-text-muted bg-brand-surface p-3.5 rounded-2xl border border-brand-border">
              <div><span className="text-brand-text-muted">Category:</span> <strong className="text-brand-navy">{reviewing.category}</strong></div>
              <div><span className="text-brand-text-muted">Fuel:</span> <strong className="text-brand-navy">{reviewing.fuelType}</strong></div>
              <div><span className="text-brand-text-muted">Year:</span> <strong className="text-brand-navy">{reviewing.manufacturingYear}</strong></div>
              <div><span className="text-brand-text-muted">Transmission:</span> <strong className="text-brand-navy">{reviewing.transmission}</strong></div>
              <div><span className="text-brand-text-muted">Location:</span> <strong className="text-brand-navy">{reviewing.location}</strong></div>
              <div><span className="text-brand-text-muted">Rate:</span> <strong className="text-brand-navy">₹{reviewing.dailyRentalPrice}/day</strong></div>
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-text-muted mb-1">Rejection reason (optional)</label>
              <input
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Documents incomplete"
                className="w-full px-3 py-2 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setReviewing(null)} className="flex-1 py-2 rounded-xl border border-brand-border text-sm text-brand-navy hover:bg-brand-surface">
                Cancel
              </button>
              <button
                onClick={() => handleReject(reviewing.id)}
                className="flex-1 py-2 rounded-xl bg-red-100 text-brand-danger font-bold text-sm hover:bg-red-200"
              >
                Reject
              </button>
              <button
                onClick={() => { handleQuickApprove(reviewing.id); setReviewing(null); }}
                className="flex-1 py-2 rounded-xl bg-brand-emerald text-white font-bold text-sm hover:bg-brand-emerald-dark shadow-sm"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
