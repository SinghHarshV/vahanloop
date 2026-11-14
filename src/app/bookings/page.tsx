'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMarketplace } from '@/context/MarketplaceContext';
import { useAuth } from '@/context/AuthContext';
import { BookingCard } from '@/components/booking/BookingCard';
import { BookingStatus } from '@/types';
import { CalendarCheck, Car, Compass, Clock, CheckCircle2 } from 'lucide-react';

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <CalendarCheck className="w-4 h-4" />
            <span>Reservation Tracker</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            My Vehicle Bookings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Logged in as <strong className="text-slate-800">{currentUser?.name || 'Guest'}</strong> ({currentUser?.email || 'Not logged in'})
          </p>
        </div>

        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-emerald-600 transition-colors shadow-sm"
        >
          <Compass className="w-4 h-4" />
          Browse More Vehicles
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          All Reservations ({customerBookings.length})
        </button>

        <button
          onClick={() => setActiveTab('active')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors ${
            activeTab === 'active'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Active / Upcoming
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors ${
            activeTab === 'completed'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Past & Cancelled
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((booking) => <BookingCard key={booking.id} booking={booking} />)
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
            <Car className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No bookings in this category</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Ready for your next journey? Browse verified cars and bikes on VahanLoop.
            </p>
            <Link
              href="/explore"
              className="inline-block px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-emerald-600 transition-colors"
            >
              Explore Fleet
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
