'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMarketplace } from '@/context/MarketplaceContext';
import { useAuth } from '@/context/AuthContext';
import { BookingCard } from '@/components/booking/BookingCard';
import { BookingStatus } from '@/types';
import { CalendarCheck, Car, Compass, Clock, CheckCircle2, Sparkles } from 'lucide-react';

export default function BookingsPage() {
  const { bookings } = useMarketplace();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');

  // Customer's bookings or all if in admin/demo
  const customerBookings = currentUser
    ? bookings.filter((b) => b.customerId === currentUser.id)
    : [];

  const filtered = customerBookings.filter((b) => {
    if (activeTab === 'active') {
      return (
        b.status === 'requested' ||
        b.status === 'awaiting_payment' ||
        b.status === 'confirmed'
      );
    }
    if (activeTab === 'completed') {
      return b.status === 'completed' || b.status === 'cancelled' || b.status === 'rejected';
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-brand-border">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-emerald uppercase tracking-wider mb-1.5">
            <CalendarCheck className="w-4 h-4" />
            <span>Trip Management</span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-brand-navy">
            My Vehicle Reservations
          </h1>
          <p className="text-xs sm:text-sm text-brand-text-muted mt-1">
            Logged in as <strong className="text-brand-navy font-bold">{currentUser?.name || 'Guest'}</strong> ({currentUser?.email || 'Not logged in'})
          </p>
        </div>

        <Link
          href="/explore"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-brand-navy hover:bg-brand-emerald text-white transition-all shadow-floating"
        >
          <Compass className="w-4 h-4" />
          Explore Fleet
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-brand-border pb-3 text-xs font-bold">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-full transition-all ${
            activeTab === 'all'
              ? 'bg-brand-navy text-white shadow-sm'
              : 'text-brand-text-muted hover:text-brand-navy hover:bg-brand-surface'
          }`}
        >
          All Reservations ({customerBookings.length})
        </button>

        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-full transition-all ${
            activeTab === 'active'
              ? 'bg-brand-navy text-white shadow-sm'
              : 'text-brand-text-muted hover:text-brand-navy hover:bg-brand-surface'
          }`}
        >
          Active / Pending (
          {
            customerBookings.filter(
              (b) =>
                b.status === 'requested' ||
                b.status === 'awaiting_payment' ||
                b.status === 'confirmed'
            ).length
          }
          )
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-full transition-all ${
            activeTab === 'completed'
              ? 'bg-brand-navy text-white shadow-sm'
              : 'text-brand-text-muted hover:text-brand-navy hover:bg-brand-surface'
          }`}
        >
          Completed / Past (
          {
            customerBookings.filter(
              (b) => b.status === 'completed' || b.status === 'cancelled' || b.status === 'rejected'
            ).length
          }
          )
        </button>
      </div>

      {/* List */}
      {filtered.length > 0 ? (
        <div className="space-y-5">
          {filtered.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-brand-border p-12 text-center shadow-card space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-surface flex items-center justify-center mx-auto text-brand-text-muted">
            <Car className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h3 className="text-lg font-display font-bold text-brand-navy">No reservations found</h3>
          <p className="text-xs text-brand-text-muted max-w-sm mx-auto">
            {activeTab === 'all'
              ? "You haven't made any vehicle bookings yet. Explore our verified fleet to get started."
              : `You have no ${activeTab} reservations at the moment.`}
          </p>
          <Link
            href="/explore"
            className="inline-block mt-2 px-6 py-2.5 rounded-full text-xs font-bold bg-brand-navy hover:bg-brand-emerald text-white transition-colors"
          >
            Find a Vehicle
          </Link>
        </div>
      )}
    </div>
  );
}
