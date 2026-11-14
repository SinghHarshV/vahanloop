'use client';

import React from 'react';
import Link from 'next/link';
import { useMarketplace } from '@/context/MarketplaceContext';
import { useAuth } from '@/context/AuthContext';
import { OwnerNav } from '@/components/owner/OwnerNav';
import {
  Car,
  CheckCircle2,
  Clock,
  CalendarDays,
  IndianRupee,
  PlusCircle,
  ArrowRight,
  Sparkles,
  Inbox,
} from 'lucide-react';

export default function OwnerDashboardPage() {
  const { vehicles, bookings, updateBookingStatus } = useMarketplace();
  const { currentUser } = useAuth();

  // Filter for this owner
  const ownerVehicles = vehicles.filter((v) => v.ownerId === currentUser?.id);
  const activeVehicles = ownerVehicles.filter(
    (v) => (v.approvalStatus as string).toLowerCase() === 'approved' && v.isActive
  );
  const pendingApprovalVehicles = ownerVehicles.filter(
    (v) => (v.approvalStatus as string).toLowerCase() === 'pending'
  );

  const ownerBookings = bookings.filter(
    (b) => b.ownerId === currentUser?.id || b.vehicle?.ownerId === currentUser?.id
  );
  const pendingRequests = ownerBookings.filter(
    (b) => (b.status as string).toLowerCase() === 'requested'
  );

  // Simulated earnings
  const totalEarnings = ownerBookings
    .filter((b) => {
      const s = (b.status as string).toLowerCase();
      return s === 'confirmed' || s === 'completed';
    })
    .reduce((acc, b) => acc + (b.ownerEarnings || (b.totalAmount - b.serviceFee - b.securityDeposit)), 0);

  return (
    <div className="space-y-6 pb-16">
      <OwnerNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Partner Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, {currentUser?.fullName?.split(' ')[0] ?? 'Partner'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Manage your mobility fleet, approve incoming guest reservations, and monitor revenue.
            </p>
          </div>
          <Link
            href="/owner/add-vehicle"
            className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow-lg flex items-center gap-2 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            Register New Vehicle
          </Link>
        </div>

        {/* 5 Overview Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total Fleet</span>
              <Car className="w-4 h-4 text-slate-500" />
            </div>
            <p className="text-2xl font-black text-slate-900">{ownerVehicles.length}</p>
            <p className="text-[11px] text-slate-400">Registered units</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Active Live</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-black text-emerald-600">{activeVehicles.length}</p>
            <p className="text-[11px] text-slate-400">Visible to customers</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Pending Review</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-amber-600">{pendingApprovalVehicles.length}</p>
            <p className="text-[11px] text-slate-400">Admin verification</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Reservations</span>
              <CalendarDays className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-black text-slate-900">{ownerBookings.length}</p>
            <p className="text-[11px] text-slate-400">Total requests</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-1 col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Earnings</span>
              <IndianRupee className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">₹{Math.round(totalEarnings).toLocaleString('en-IN')}</p>
            <p className="text-[11px] text-slate-400">Simulated payout</p>
          </div>
        </div>

        {/* Pending Booking Requests */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Inbox className="w-5 h-5 text-amber-600" />
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Pending Booking Requests ({pendingRequests.length})
                </h2>
                <p className="text-xs text-slate-500">Accept requests to allow customers to simulate checkout.</p>
              </div>
            </div>
            <Link href="/owner/requests" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
              View all requests <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {pendingRequests.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {pendingRequests.map((req) => {
                const start = req.pickupDateTime || req.startDate;
                const end = req.returnDateTime || req.endDate;
                const days = Math.ceil(
                  (new Date(end).getTime() - new Date(start).getTime()) / 86400000
                ) || 1;
                const ownerEarnings = req.ownerEarnings || Math.round(req.totalAmount * 0.85);
                return (
                  <div key={req.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1 text-xs">
                      <span className="font-mono text-slate-400 text-[11px]">ID: {req.id.slice(0, 14)}…</span>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {req.vehicleTitle || (req.vehicle ? `${req.vehicle.make} ${req.vehicle.model}` : req.vehicleId)}
                      </h4>
                      <p className="text-slate-600">
                        Customer: <strong className="text-slate-800">{req.customerName || req.customer?.fullName || 'Guest Customer'}</strong>
                        {req.customerEmail ? ` (${req.customerEmail})` : ''}
                      </p>
                      <p className="text-slate-500">
                        {new Date(start).toLocaleDateString('en-IN')} →{' '}
                        {new Date(end).toLocaleDateString('en-IN')} ({days} days) ·{' '}
                        <span className="capitalize">{req.rentalType.replace('_', '-').toLowerCase()}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-left md:text-right text-xs">
                        <p className="text-slate-400">Est. Host Earnings</p>
                        <p className="text-base font-black text-slate-900">₹{ownerEarnings.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateBookingStatus(req.id, 'accept')}
                          className="px-3.5 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-xl shadow-sm hover:bg-emerald-700 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => updateBookingStatus(req.id, 'reject', undefined, 'Host vehicle unavailable')}
                          className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No pending requests. All customer reservations have been handled!
            </div>
          )}
        </div>

        {/* Fleet Quick Status */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Fleet Overview</h2>
            <Link href="/owner/vehicles" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
              Manage Fleet <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ownerVehicles.slice(0, 4).map((veh) => (
              <div key={veh.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-slate-400">{veh.id.slice(0, 10)}…</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      veh.approvalStatus === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : veh.approvalStatus === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {veh.approvalStatus}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 truncate">{veh.make} {veh.model}</h4>
                <p className="text-slate-500">₹{veh.dailyRentalPrice}/day · {veh.location}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
