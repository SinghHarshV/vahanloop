'use client';

import React, { useState, useEffect } from 'react';
import { OwnerNav } from '@/components/owner/OwnerNav';
import { useMarketplace } from '@/context/MarketplaceContext';
import {
  Users,
  PlusCircle,
  CheckCircle2,
  Clock,
  Car,
  Phone,
  ShieldCheck,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export default function OwnerDriversPage() {
  const { bookings } = useMarketplace();
  const [drivers, setDrivers] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');
  const [assignmentNotes, setAssignmentNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string>('');

  // Register Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [licenceCategory, setLicenceCategory] = useState('LMV-TR');
  const [licenceNumber, setLicenceNumber] = useState('');
  const [employmentType, setEmploymentType] = useState('CONTRACTOR');

  const fetchData = async () => {
    try {
      const [dRes, aRes] = await Promise.all([
        fetch('/api/drivers'),
        fetch('/api/drivers/assignments'),
      ]);
      if (dRes.ok) {
        const d = await dRes.json();
        setDrivers(d.drivers || []);
      }
      if (aRes.ok) {
        const a = await aRes.json();
        setAssignments(a.assignments || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const chauffeurBookings = bookings.filter(
    (b) => (b.rentalType as string) === 'with-driver' || (b.rentalType as string).toUpperCase() === 'CHAUFFEUR'
  );

  const handleRegisterDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    try {
      const res = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REGISTER',
          fullName,
          phone,
          email,
          licenceCategory,
          licenceNumber,
          employmentType,
          orgId: 'org-fleet-01',
        }),
      });

      if (res.ok) {
        setMessage('Commercial driver profile registered. Awaiting compliance verification.');
        setShowAddModal(false);
        setFullName('');
        setPhone('');
        setEmail('');
        setLicenceNumber('');
        await fetchData();
      } else {
        const d = await res.json();
        setMessage(`Error: ${d.error || 'Failed to register driver'}`);
      }
    } catch {
      setMessage('Network error registering driver.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriverId || !selectedBookingId) return;
    setIsSubmitting(true);
    setMessage('');

    try {
      const res = await fetch('/api/drivers/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ASSIGN',
          bookingId: selectedBookingId,
          driverId: selectedDriverId,
          notes: assignmentNotes || undefined,
        }),
      });

      const d = await res.json();
      if (res.ok) {
        setMessage('Driver dispatched to trip reservation successfully.');
        setShowAssignModal(false);
        setSelectedDriverId('');
        setSelectedBookingId('');
        setAssignmentNotes('');
        await fetchData();
      } else {
        setMessage(`Assignment Failed: ${d.error || 'Check overlapping schedule'}`);
      }
    } catch {
      setMessage('Network failure dispatching driver.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <OwnerNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-brand-border">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-brand-navy">
              Professional Driver Roster &amp; Dispatch
            </h1>
            <p className="text-xs sm:text-sm text-brand-text-muted">
              Manage commercial chauffeurs, schedule trip assignments, and track real-time duty status.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAssignModal(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-surface hover:bg-slate-200/60 text-brand-navy border border-brand-border flex items-center gap-1.5 transition-colors"
            >
              <Car className="w-4 h-4 text-brand-emerald" />
              <span>Assign to Chauffeur Trip</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-emerald hover:bg-brand-emerald-dark text-white shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Driver</span>
            </button>
          </div>
        </div>

        {message && (
          <div className="p-3 bg-brand-emerald-subtle border border-brand-emerald/30 text-brand-emerald text-xs rounded-2xl flex items-center justify-between">
            <span>{message}</span>
            <button onClick={() => setMessage('')} className="font-bold">×</button>
          </div>
        )}

        {/* Drivers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drivers.map((drv) => {
            const isAvail = drv.availabilityStatus === 'AVAILABLE';
            const isOnDuty = drv.availabilityStatus === 'ON_DUTY';
            const isAssigned = drv.availabilityStatus === 'ASSIGNED';

            return (
              <div
                key={drv.id}
                className="bg-white rounded-3xl border border-brand-border shadow-card p-6 space-y-4 hover:shadow-floating transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-brand-text-muted text-[10px]">{drv.id}</span>
                    <h3 className="text-base font-display font-bold text-brand-navy mt-0.5">
                      {drv.fullName}
                    </h3>
                    <p className="text-xs text-brand-text-muted">{drv.employmentType} · {drv.licenceCategory}</p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      isAvail
                        ? 'bg-brand-emerald-subtle text-brand-emerald'
                        : isOnDuty
                        ? 'bg-blue-100 text-blue-800'
                        : isAssigned
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-brand-surface text-brand-text-muted'
                    }`}
                  >
                    {drv.availabilityStatus}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-brand-text-muted">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-brand-emerald" />
                    <span>{drv.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-emerald" />
                    <span>Licence: {drv.licenceNumber} (Verified)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-brand-border flex items-center justify-between text-xs">
                  <span className="text-brand-text-muted">Rating: ⭐ {drv.rating || '5.0'}</span>
                  <span className="font-bold text-brand-navy">{drv.totalTrips || 0} Trips Completed</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Driver Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-floating border border-brand-border">
            <h3 className="text-lg font-display font-bold text-brand-navy">Register Commercial Driver</h3>
            <form onSubmit={handleRegisterDriver} className="space-y-3 text-xs">
              <div>
                <label className="block text-brand-text-muted mb-1 font-semibold">Full Legal Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="As per Commercial Driving Licence"
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-brand-text-muted mb-1 font-semibold">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="+91..."
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-brand-text-muted mb-1 font-semibold">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="driver@..."
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-brand-text-muted mb-1 font-semibold">Licence Class</label>
                  <select
                    value={licenceCategory}
                    onChange={(e) => setLicenceCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-white"
                  >
                    <option value="LMV-TR">LMV-TR (Commercial Transport)</option>
                    <option value="LMV">LMV (Light Motor Vehicle)</option>
                    <option value="HMV">HMV (Heavy Transport)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-brand-text-muted mb-1 font-semibold">Licence Number</label>
                  <input
                    type="text"
                    value={licenceNumber}
                    onChange={(e) => setLicenceNumber(e.target.value)}
                    placeholder="KA-01-2015000..."
                    required
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-brand-text-muted mb-1 font-semibold">Employment Model</label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-white"
                >
                  <option value="CONTRACTOR">Independent Contractor (Gig)</option>
                  <option value="FULL_TIME">Full-time Fleet Employee</option>
                  <option value="PART_TIME">Part-time Partner</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-brand-border rounded-xl text-brand-navy font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold rounded-xl shadow-sm"
                >
                  {isSubmitting ? 'Registering...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Driver Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-floating border border-brand-border">
            <h3 className="text-lg font-display font-bold text-brand-navy">Dispatch Driver to Chauffeur Booking</h3>
            <form onSubmit={handleAssignDriver} className="space-y-3 text-xs">
              <div>
                <label className="block text-brand-text-muted mb-1 font-semibold">Select Chauffeur Reservation</label>
                <select
                  value={selectedBookingId}
                  onChange={(e) => setSelectedBookingId(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-white"
                >
                  <option value="">-- Choose active booking --</option>
                  {chauffeurBookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.vehicleTitle} · {b.customerName} ({b.startDate} → {b.endDate})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-brand-text-muted mb-1 font-semibold">Select Available Driver</label>
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-white"
                >
                  <option value="">-- Choose verified driver --</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fullName} ({d.licenceCategory}) - Status: {d.availabilityStatus}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-brand-text-muted mb-1 font-semibold">Special Instructions (Optional)</label>
                <input
                  type="text"
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  placeholder="e.g. Flight arrival terminal pickup with name placard"
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 border border-brand-border rounded-xl text-brand-navy font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedDriverId || !selectedBookingId}
                  className="px-5 py-2 bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold rounded-xl shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Dispatching...' : 'Confirm Dispatch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
