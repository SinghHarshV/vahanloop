'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMarketplace } from '@/context/MarketplaceContext';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Car,
  AlertTriangle,
  ArrowRight,
  ClipboardCheck,
  Fuel,
  Gauge,
  Camera,
  X,
  ShieldAlert,
} from 'lucide-react';

export default function RentalOperationsPage() {
  const { bookings, vehicles } = useMarketplace();
  const [filterCity, setFilterCity] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [statusMessage, setStatusMessage] = useState('');

  // Modals
  const [handoverBooking, setHandoverBooking] = useState<any>(null);
  const [returnBooking, setReturnBooking] = useState<any>(null);

  // Handover form
  const [handoverOdo, setHandoverOdo] = useState('24500');
  const [handoverFuel, setHandoverFuel] = useState('100');
  const [handoverCond, setHandoverCond] = useState<'EXCELLENT' | 'GOOD' | 'FAIR' | 'DAMAGED'>('EXCELLENT');
  const [handoverNotes, setHandoverNotes] = useState('');

  // Return form
  const [returnOdo, setReturnOdo] = useState('24890');
  const [returnFuel, setReturnFuel] = useState('100');
  const [returnCond, setReturnCond] = useState<'EXCELLENT' | 'GOOD' | 'FAIR' | 'DAMAGED'>('EXCELLENT');
  const [returnNotes, setReturnNotes] = useState('');
  const [disputeRaised, setDisputeRaised] = useState(false);
  const [disputeNotes, setDisputeNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredBookings = bookings.filter((b) => {
    const s = (b.status as string).toUpperCase();
    if (filterStatus !== 'ALL') {
      if (filterStatus === 'ACTIVE' && s !== 'ACTIVE') return false;
      if (filterStatus === 'CONFIRMED' && s !== 'CONFIRMED') return false;
      if (filterStatus === 'COMPLETED' && s !== 'COMPLETED') return false;
    }
    return true;
  });

  const activeCount = bookings.filter((b) => (b.status as string).toUpperCase() === 'ACTIVE').length;
  const confirmedCount = bookings.filter((b) => (b.status as string).toUpperCase() === 'CONFIRMED').length;
  const completedCount = bookings.filter((b) => (b.status as string).toUpperCase() === 'COMPLETED').length;

  const handleCompleteHandover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverBooking) return;
    setIsSubmitting(true);
    setStatusMessage('');

    try {
      const res = await fetch('/api/operations/handover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: handoverBooking.id,
          odometerReading: Number(handoverOdo),
          fuelLevelPercent: Number(handoverFuel),
          conditionRating: handoverCond,
          notes: handoverNotes || 'Handover verified with customer.',
        }),
      });

      if (res.ok) {
        setStatusMessage(`Vehicle handover completed for ${handoverBooking.id}. Trip is now ACTIVE.`);
        setHandoverBooking(null);
      } else {
        const d = await res.json();
        setStatusMessage(`Handover error: ${d.error || 'Failed'}`);
      }
    } catch {
      setStatusMessage('Network failure logging handover.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnBooking) return;
    setIsSubmitting(true);
    setStatusMessage('');

    try {
      const res = await fetch('/api/operations/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: returnBooking.id,
          odometerReading: Number(returnOdo),
          fuelLevelPercent: Number(returnFuel),
          conditionRating: returnCond,
          notes: returnNotes || 'Return inspection verified.',
          disputeRaised,
          disputeNotes: disputeRaised ? disputeNotes : undefined,
        }),
      });

      if (res.ok) {
        setStatusMessage(`Vehicle return verified for ${returnBooking.id}. Status updated to COMPLETED.`);
        setReturnBooking(null);
      } else {
        const d = await res.json();
        setStatusMessage(`Return error: ${d.error || 'Failed'}`);
      }
    } catch {
      setStatusMessage('Network failure logging return.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-brand-navy text-white rounded-3xl p-6 sm:p-8 shadow-floating flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-brand-emerald-accent border border-white/15 mb-1">
            <ClipboardCheck className="w-3.5 h-3.5 text-brand-emerald" />
            <span>Rental Operations &amp; Telemetry Command</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">
            Handover &amp; Return Checkpoint Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Log digital odometer checks, fuel/charge levels, vehicle damage comparisons, and dispute protocols.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/incidents"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-red-500/20 hover:bg-red-500/30 text-white border border-red-400/30 flex items-center gap-1.5 transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>Emergency &amp; Incidents</span>
          </Link>
          <Link
            href="/support"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors"
          >
            Support Desk
          </Link>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-brand-emerald-subtle border border-brand-emerald/30 text-brand-emerald text-xs rounded-2xl flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage('')} className="font-bold">×</button>
        </div>
      )}

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-brand-border shadow-card space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-muted">Confirmed (Ready for Pickup)</span>
          <p className="text-2xl font-display font-black text-brand-navy">{confirmedCount}</p>
          <p className="text-[11px] text-brand-text-muted">Awaiting handover checkpoint</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-brand-border shadow-card space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-muted">Active On-Road Rentals</span>
          <p className="text-2xl font-display font-black text-brand-emerald">{activeCount}</p>
          <p className="text-[11px] text-brand-text-muted">Vehicles on live trips</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-brand-border shadow-card space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-muted">Completed Trips</span>
          <p className="text-2xl font-display font-black text-brand-navy">{completedCount}</p>
          <p className="text-[11px] text-brand-text-muted">Successfully returned &amp; reconciled</p>
        </div>
      </div>

      {/* Bookings Ledger */}
      <div className="bg-white rounded-3xl border border-brand-border shadow-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand-border">
          <div>
            <h2 className="text-lg font-display font-bold text-brand-navy">Platform Rental Reservations</h2>
            <p className="text-xs text-brand-text-muted">Select a booking to execute vehicle handover or return verification.</p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-brand-border bg-brand-surface font-semibold text-brand-navy"
            >
              <option value="ALL">All Statuses</option>
              <option value="CONFIRMED">Ready for Handover (CONFIRMED)</option>
              <option value="ACTIVE">On Live Trip (ACTIVE)</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-brand-border text-brand-text-muted uppercase tracking-wider text-[10px]">
                <th className="pb-3">Booking ID</th>
                <th className="pb-3">Vehicle</th>
                <th className="pb-3">Guest &amp; Dates</th>
                <th className="pb-3">Rental Mode</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Operations Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {filteredBookings.map((b) => {
                const s = (b.status as string).toUpperCase();
                const isConfirmed = s === 'CONFIRMED';
                const isActive = s === 'ACTIVE';
                const isCompleted = s === 'COMPLETED';

                return (
                  <tr key={b.id} className="py-2.5">
                    <td className="py-3 font-mono text-[11px] text-brand-text-muted">{b.id}</td>
                    <td className="py-3 font-bold text-brand-navy">
                      {b.vehicle ? `${b.vehicle.make} ${b.vehicle.model}` : b.vehicleTitle || b.vehicleId}
                    </td>
                    <td className="py-3">
                      <p className="font-semibold text-brand-navy">{b.customerName || b.customer?.fullName || 'Guest'}</p>
                      <p className="text-[10px] text-brand-text-muted">{b.startDate} → {b.endDate}</p>
                    </td>
                    <td className="py-3 uppercase text-[10px] font-bold text-brand-navy">
                      {(b.rentalType || 'SELF_DRIVE').replace('_', ' ')}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isCompleted
                            ? 'bg-brand-emerald-subtle text-brand-emerald'
                            : isActive
                            ? 'bg-blue-100 text-blue-800'
                            : isConfirmed
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-brand-surface text-brand-text-muted'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {isConfirmed && (
                        <button
                          onClick={() => setHandoverBooking(b)}
                          className="px-3 py-1.5 rounded-xl bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold text-xs shadow-sm transition-colors"
                        >
                          Perform Handover
                        </button>
                      )}
                      {isActive && (
                        <button
                          onClick={() => setReturnBooking(b)}
                          className="px-3 py-1.5 rounded-xl bg-brand-navy hover:bg-brand-navy-light text-white font-bold text-xs shadow-sm transition-colors"
                        >
                          Verify Return
                        </button>
                      )}
                      {isCompleted && (
                        <span className="text-brand-emerald font-bold text-xs">Reconciled</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Handover Modal */}
      {handoverBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-floating border border-brand-border">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-display font-bold text-brand-navy">Vehicle Handover Verification</h3>
              <button onClick={() => setHandoverBooking(null)} className="text-brand-text-muted hover:text-brand-navy">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-brand-text-muted">
              Booking: <strong className="text-brand-navy">{handoverBooking.id}</strong> ({handoverBooking.vehicleTitle})
            </p>

            <form onSubmit={handleCompleteHandover} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-brand-text-muted mb-1 font-semibold flex items-center gap-1">
                    <Gauge className="w-3.5 h-3.5 text-brand-emerald" /> Pickup Odometer (km)
                  </label>
                  <input
                    type="number"
                    value={handoverOdo}
                    onChange={(e) => setHandoverOdo(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-brand-text-muted mb-1 font-semibold flex items-center gap-1">
                    <Fuel className="w-3.5 h-3.5 text-brand-emerald" /> Fuel / Battery (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={handoverFuel}
                    onChange={(e) => setHandoverFuel(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-white font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-brand-text-muted mb-1 font-semibold">Initial Vehicle Condition</label>
                <select
                  value={handoverCond}
                  onChange={(e) => setHandoverCond(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-white font-semibold"
                >
                  <option value="EXCELLENT">Pristine / Excellent (Zero Blemishes)</option>
                  <option value="GOOD">Good (Standard Road Dust)</option>
                  <option value="FAIR">Fair (Minor pre-existing paint chips)</option>
                  <option value="DAMAGED">Pre-existing Visible Dent / Scratch</option>
                </select>
              </div>

              <div>
                <label className="block text-brand-text-muted mb-1 font-semibold">Handover Checklist Notes</label>
                <input
                  type="text"
                  value={handoverNotes}
                  onChange={(e) => setHandoverNotes(e.target.value)}
                  placeholder="e.g. Spare wheel, jack, and documents verified."
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setHandoverBooking(null)}
                  className="px-4 py-2 border border-brand-border rounded-xl text-brand-navy font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold rounded-xl shadow-sm"
                >
                  {isSubmitting ? 'Recording...' : 'Confirm Handover (Start Trip)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {returnBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-floating border border-brand-border">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-display font-bold text-brand-navy">Return Inspection &amp; Reconcile</h3>
              <button onClick={() => setReturnBooking(null)} className="text-brand-text-muted hover:text-brand-navy">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-brand-text-muted">
              Booking: <strong className="text-brand-navy">{returnBooking.id}</strong> ({returnBooking.vehicleTitle})
            </p>

            <form onSubmit={handleCompleteReturn} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-brand-text-muted mb-1 font-semibold flex items-center gap-1">
                    <Gauge className="w-3.5 h-3.5 text-brand-emerald" /> Return Odometer (km)
                  </label>
                  <input
                    type="number"
                    value={returnOdo}
                    onChange={(e) => setReturnOdo(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-brand-text-muted mb-1 font-semibold flex items-center gap-1">
                    <Fuel className="w-3.5 h-3.5 text-brand-emerald" /> Return Fuel / Charge (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={returnFuel}
                    onChange={(e) => setReturnFuel(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-white font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-brand-text-muted mb-1 font-semibold">Return Vehicle Condition</label>
                <select
                  value={returnCond}
                  onChange={(e) => setReturnCond(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-white font-semibold"
                >
                  <option value="EXCELLENT">Pristine / Excellent (Matches Pickup)</option>
                  <option value="GOOD">Good (Standard Wear)</option>
                  <option value="FAIR">Fair (Requires Deep Cleaning)</option>
                  <option value="DAMAGED">New Damage / Scratch Found</option>
                </select>
              </div>

              <label className="flex items-center gap-2 p-3 rounded-xl border border-brand-border bg-brand-surface cursor-pointer">
                <input
                  type="checkbox"
                  checked={disputeRaised}
                  onChange={(e) => setDisputeRaised(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-danger focus:ring-brand-danger"
                />
                <span className="font-semibold text-brand-navy">Flag for Formal Damage / Fuel Dispute Review</span>
              </label>

              {disputeRaised && (
                <div>
                  <label className="block text-brand-text-muted mb-1 font-semibold">Dispute Particulars</label>
                  <textarea
                    value={disputeNotes}
                    onChange={(e) => setDisputeNotes(e.target.value)}
                    placeholder="Describe specific damage or fuel variance for claims assessor."
                    rows={2}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-white"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReturnBooking(null)}
                  className="px-4 py-2 border border-brand-border rounded-xl text-brand-navy font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-brand-navy hover:bg-brand-navy-light text-white font-bold rounded-xl shadow-sm"
                >
                  {isSubmitting ? 'Verifying...' : 'Complete & Release Deposit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
