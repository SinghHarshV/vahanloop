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
  ShieldCheck,
  TrendingUp,
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
    <div className="space-y-8 pb-16">
      <OwnerNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-brand-navy rounded-3xl p-8 sm:p-10 text-white shadow-floating border border-brand-navy-light/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/20 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-brand-emerald" />
              <span>Partner Command Center</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight">
              Welcome back, {currentUser?.fullName?.split(' ')[0] ?? 'Host'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Oversee your fleet performance, review customer rental requests, and track your simulated earnings.
            </p>
          </div>
          <Link
            href="/owner/add-vehicle"
            className="px-6 py-3 rounded-full font-bold text-xs sm:text-sm bg-brand-emerald hover:bg-brand-emerald-dark text-white shadow-floating transition-all flex items-center gap-2 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            Register New Vehicle
          </Link>
        </div>

        {/* 5 Executive Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-brand-border shadow-card space-y-1.5">
            <div className="flex items-center justify-between text-brand-text-muted">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Fleet</span>
              <Car className="w-4 h-4 text-brand-navy" />
            </div>
            <p className="text-2xl sm:text-3xl font-display font-black text-brand-navy">
              {ownerVehicles.length}
            </p>
            <p className="text-[11px] text-brand-text-muted font-medium">Registered vehicles</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-brand-border shadow-card space-y-1.5">
            <div className="flex items-center justify-between text-brand-text-muted">
              <span className="text-[10px] font-bold uppercase tracking-wider">Active Public</span>
              <CheckCircle2 className="w-4 h-4 text-brand-emerald" />
            </div>
            <p className="text-2xl sm:text-3xl font-display font-black text-brand-emerald">
              {activeVehicles.length}
            </p>
            <p className="text-[11px] text-brand-text-muted font-medium">Bookable on explore</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-brand-border shadow-card space-y-1.5">
            <div className="flex items-center justify-between text-brand-text-muted">
              <span className="text-[10px] font-bold uppercase tracking-wider">Under Review</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-display font-black text-amber-600">
              {pendingApprovalVehicles.length}
            </p>
            <p className="text-[11px] text-brand-text-muted font-medium">Awaiting admin review</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-brand-border shadow-card space-y-1.5">
            <div className="flex items-center justify-between text-brand-text-muted">
              <span className="text-[10px] font-bold uppercase tracking-wider">Requests</span>
              <Inbox className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-display font-black text-blue-600">
              {pendingRequests.length}
            </p>
            <p className="text-[11px] text-brand-text-muted font-medium">Pending your approval</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-brand-border shadow-card space-y-1.5 col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-brand-text-muted">
              <span className="text-[10px] font-bold uppercase tracking-wider">Earnings</span>
              <IndianRupee className="w-4 h-4 text-brand-emerald" />
            </div>
            <p className="text-2xl sm:text-3xl font-display font-black text-brand-navy">
              ₹{totalEarnings.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-brand-text-muted font-medium">Simulated payouts</p>
          </div>
        </div>

        {/* Action Center: Pending Requests */}
        <div className="bg-white rounded-3xl border border-brand-border shadow-card p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between border-b border-brand-border pb-4">
            <div>
              <h2 className="text-lg font-display font-bold text-brand-navy">
                Incoming Rental Requests
              </h2>
              <p className="text-xs text-brand-text-muted mt-0.5">
                Respond swiftly to secure guest bookings. Accepting triggers an automatic 15-minute reservation hold.
              </p>
            </div>
            <Link
              href="/owner/requests"
              className="text-xs font-bold text-brand-emerald hover:text-brand-emerald-dark flex items-center gap-1"
            >
              View all requests &rarr;
            </Link>
          </div>

          {pendingRequests.length > 0 ? (
            <div className="space-y-4">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-5 rounded-2xl bg-brand-surface border border-brand-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20">
                        Pending Decision
                      </span>
                      <span className="text-xs font-mono text-brand-text-muted">#{req.id}</span>
                    </div>
                    <h4 className="font-bold text-brand-navy text-sm">{req.vehicleTitle}</h4>
                    <p className="text-xs text-brand-text-muted">
                      Guest: <strong className="text-brand-navy">{req.customerName}</strong> ({req.customerPhone})
                      · {req.startDate} to {req.endDate} ({req.totalDays} days) · {req.rentalType}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                      onClick={() => updateBookingStatus(req.id, 'awaiting_payment')}
                      className="flex-1 md:flex-none px-5 py-2.5 rounded-full text-xs font-bold bg-brand-emerald hover:bg-brand-emerald-dark text-white shadow-sm transition-all"
                    >
                      Accept Request
                    </button>
                    <button
                      onClick={() => updateBookingStatus(req.id, 'rejected')}
                      className="flex-1 md:flex-none px-4 py-2.5 rounded-full text-xs font-semibold text-brand-danger bg-brand-danger/10 hover:bg-brand-danger/20 transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-brand-text-muted">
              No pending reservation requests right now. Your listings will appear on explore when active.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
