'use client';

import React, { useState } from 'react';
import { OwnerNav } from '@/components/owner/OwnerNav';
import { useMarketplace } from '@/context/MarketplaceContext';
import { useAuth } from '@/context/AuthContext';
import {
  ClipboardCheck,
  CheckCircle2,
  Gauge,
  Fuel,
  Camera,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';

export default function OwnerInspectionsPage() {
  const { bookings } = useMarketplace();
  const { currentUser } = useAuth();

  const [bookingId, setBookingId] = useState<string>('');
  const [inspectionType, setInspectionType] = useState<'PICKUP' | 'RETURN'>('PICKUP');
  const [odometer, setOdometer] = useState<string>('24500');
  const [fuel, setFuel] = useState<string>('100');
  const [condition, setCondition] = useState<string>('EXCELLENT');
  const [damageNotes, setDamageNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const myBookings = currentUser
    ? bookings.filter((b) => b.ownerId === currentUser.id)
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId) return;
    setIsSubmitting(true);
    setStatusMessage('');

    try {
      const res = await fetch('/api/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          bookingId,
          inspectionType,
          odometerReading: Number(odometer),
          fuelLevelPercent: Number(fuel),
          vehicleCondition: condition,
          visibleDamage: damageNotes || null,
          items: [
            { component: 'TYRES', statusOk: true },
            { component: 'LIGHTS', statusOk: true },
            { component: 'BODY_PANELS', statusOk: !damageNotes },
          ],
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMessage(`${inspectionType} inspection logged successfully.`);
      } else {
        setStatusMessage(`Error: ${data.error || 'Failed to submit inspection'}`);
      }
    } catch {
      setStatusMessage('Network error submitting inspection');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <OwnerNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Handover &amp; Return Inspections
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Capture verified odometer logs, fuel levels, and existing condition before and after rentals.
          </p>
        </div>

        {statusMessage && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl flex items-center justify-between">
            <span>{statusMessage}</span>
            <button onClick={() => setStatusMessage('')} className="font-bold ml-2">×</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-emerald-600" /> Log Vehicle Inspection
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Reservation</label>
                <select
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-white text-slate-800"
                  required
                >
                  <option value="">-- Choose active booking --</option>
                  {myBookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.vehicleTitle} - {b.customerName} ({b.id.slice(0, 10)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Inspection Stage</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setInspectionType('PICKUP')}
                    className={`p-2.5 rounded-xl border font-bold text-xs ${
                      inspectionType === 'PICKUP' ? 'bg-emerald-50 border-emerald-500 text-emerald-900' : 'bg-slate-50 text-slate-600'
                    }`}
                  >
                    Handover (Pickup)
                  </button>
                  <button
                    type="button"
                    onClick={() => setInspectionType('RETURN')}
                    className={`p-2.5 rounded-xl border font-bold text-xs ${
                      inspectionType === 'RETURN' ? 'bg-emerald-50 border-emerald-500 text-emerald-900' : 'bg-slate-50 text-slate-600'
                    }`}
                  >
                    Return Check
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Odometer Reading (km)</label>
                  <input
                    type="number"
                    value={odometer}
                    onChange={(e) => setOdometer(e.target.value)}
                    className="w-full p-2 border rounded-xl text-slate-800 font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Fuel Level (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={fuel}
                    onChange={(e) => setFuel(e.target.value)}
                    className="w-full p-2 border rounded-xl text-slate-800 font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">General Vehicle Condition</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-white text-slate-800"
                >
                  <option value="EXCELLENT">Pristine / Excellent</option>
                  <option value="GOOD">Good (Minor wear)</option>
                  <option value="FAIR">Fair (Needs wash)</option>
                  <option value="DAMAGED">Damaged / Issue Found</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Existing Scratch / Damage Notes</label>
                <input
                  type="text"
                  value={damageNotes}
                  onChange={(e) => setDamageNotes(e.target.value)}
                  placeholder="e.g. Minor 2cm scratch on rear left bumper"
                  className="w-full p-2 border rounded-xl text-slate-800"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !bookingId}
                className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Recording Inspection...' : 'Record Verified Inspection'}
              </button>
            </form>
          </div>

          {/* Guidelines */}
          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 space-y-4 text-xs text-slate-600">
            <h3 className="text-base font-bold text-slate-900">Inspection &amp; Deposit Guidelines</h3>
            <p>
              VahanLoop requires verifiable handover records to protect both vehicle owners and guests.
            </p>
            <ul className="space-y-2 list-disc list-inside text-slate-600">
              <li>Both parties should photograph all 4 sides of the vehicle during pickup.</li>
              <li>Odometer logs prevent unauthorized long-distance usage beyond quotation.</li>
              <li>Fuel must be returned at the same level as logged during pickup.</li>
              <li>No damage penalties are deducted automatically; disputes require admin review.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
