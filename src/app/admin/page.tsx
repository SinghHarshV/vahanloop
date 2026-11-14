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
    case 'CONFIRMED': return 'bg-emerald-100 text-emerald-800';
    case 'AWAITING_PAYMENT': return 'bg-blue-100 text-blue-800';
    case 'REQUESTED': return 'bg-amber-100 text-amber-800';
    case 'CANCELLED': return 'bg-rose-100 text-rose-800';
    default: return 'bg-slate-100 text-slate-700';
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
    <div className="space-y-6 pb-16">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Platform Administration &amp; Compliance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Administrator Command Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Oversee marketplace operations, verify host vehicle listings, and supervise customer reservations.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur px-4 py-2.5 rounded-2xl border border-white/10 text-xs">
            <span className="text-purple-300 font-medium">Logged in as:</span>{' '}
            <strong className="text-white">{currentUser?.fullName ?? 'Admin'}</strong>
          </div>
        </div>

        {/* 6 Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Platform Users</span>
              <Users className="w-4 h-4 text-slate-500" />
            </div>
            <p className="text-xl font-black text-slate-900">3+</p>
            <p className="text-[10px] text-slate-400">Registered</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Vehicles</span>
              <Car className="w-4 h-4 text-slate-500" />
            </div>
            <p className="text-xl font-black text-slate-900">{vehicles.length}</p>
            <p className="text-[10px] text-slate-400">Catalogue size</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Approved</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-xl font-black text-emerald-600">{approvedVehicles.length}</p>
            <p className="text-[10px] text-slate-400">Live in search</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Pending Review</span>
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-xl font-black text-purple-600">{pendingVehicles.length}</p>
            <p className="text-[10px] text-slate-400">Requires review</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Bookings</span>
              <CalendarDays className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-xl font-black text-slate-900">{bookings.length}</p>
            <p className="text-[10px] text-slate-400">Platform orders</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Gross Spend</span>
              <IndianRupee className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xl font-black text-slate-900">₹{(grossBookingValue / 1000).toFixed(1)}k</p>
            <p className="text-[10px] text-slate-400">Simulated GBV</p>
          </div>
        </div>

        {/* Pending Vehicle Reviews Queue */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Pending Vehicle Approvals ({pendingVehicles.length})
              </h2>
              <p className="text-xs text-slate-500">
                Newly submitted partner vehicles awaiting administrator verification.
              </p>
            </div>
            <Link href="/admin/vehicles" className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1">
              All Listings <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {pendingVehicles.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {pendingVehicles.map((v) => (
                <div key={v.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="font-mono text-slate-400 text-[10px]">{v.id}</span>
                    <h4 className="text-sm font-bold text-slate-900">{v.make} {v.model} ({v.manufacturingYear})</h4>
                    <p className="text-slate-600">
                      Host: <strong>{v.owner?.fullName ?? 'Unknown'}</strong> · {v.location}
                    </p>
                    <p className="text-slate-500">
                      Category: <span className="capitalize">{v.category.toLowerCase()}</span> ·
                      Rate: ₹{v.dailyRentalPrice}/day
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setReviewing(v)}
                      className="px-3.5 py-1.5 rounded-xl font-bold bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200 transition-colors flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Inspect & Review
                    </button>
                    <button
                      onClick={() => handleQuickApprove(v.id)}
                      className="px-3.5 py-1.5 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Quick Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              All vehicles are reviewed. Zero pending approvals in the queue!
            </div>
          )}
        </div>

        {/* Recent Platform Bookings */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recent Marketplace Bookings</h2>
              <p className="text-xs text-slate-500">Live reservations across all customers and hosts.</p>
            </div>
            <Link href="/admin/bookings" className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1">
              Manage all bookings <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="pb-3">Booking ID</th>
                  <th className="pb-3">Vehicle</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Dates</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.slice(0, 5).map((b) => (
                  <tr key={b.id} className="py-2.5">
                    <td className="py-3 font-mono text-[11px] text-slate-500">{b.id.slice(0, 12)}…</td>
                    <td className="py-3 font-semibold text-slate-800">
                      {b.vehicle ? `${b.vehicle.make} ${b.vehicle.model}` : b.vehicleId}
                    </td>
                    <td className="py-3 text-slate-600">{b.customer?.fullName ?? b.customerId}</td>
                    <td className="py-3 text-slate-500">
                      {new Date(b.pickupDateTime || b.startDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short' })} →{' '}
                      {new Date(b.returnDateTime || b.endDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short' })}
                    </td>
                    <td className="py-3 font-bold text-slate-900">₹{b.totalAmount.toLocaleString('en-IN')}</td>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Review: {reviewing.make} {reviewing.model}</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
              <div><span className="text-slate-400">Category:</span> {reviewing.category}</div>
              <div><span className="text-slate-400">Fuel:</span> {reviewing.fuelType}</div>
              <div><span className="text-slate-400">Year:</span> {reviewing.manufacturingYear}</div>
              <div><span className="text-slate-400">Transmission:</span> {reviewing.transmission}</div>
              <div><span className="text-slate-400">Location:</span> {reviewing.location}</div>
              <div><span className="text-slate-400">Rate:</span> ₹{reviewing.dailyRentalPrice}/day</div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Rejection reason (optional)</label>
              <input
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Documents incomplete"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setReviewing(null)} className="flex-1 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
              <button
                onClick={() => handleReject(reviewing.id)}
                className="flex-1 py-2 rounded-xl bg-rose-100 text-rose-700 font-bold text-sm hover:bg-rose-200"
              >
                Reject
              </button>
              <button
                onClick={() => { handleQuickApprove(reviewing.id); setReviewing(null); }}
                className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700"
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
