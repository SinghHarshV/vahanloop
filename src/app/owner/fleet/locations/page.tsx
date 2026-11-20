'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { OwnerNav } from '@/components/owner/OwnerNav';
import {
  MapPin,
  PlusCircle,
  Clock,
  Phone,
  User,
  ArrowLeft,
  Building2,
  CheckCircle2,
} from 'lucide-react';

export default function FleetLocationsPage() {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [postalCode, setPostalCode] = useState('560038');
  const [operatingHours, setOperatingHours] = useState('06:00 - 23:00');
  const [contactPerson, setContactPerson] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [pickupInstructions, setPickupInstructions] = useState('');

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/fleet/locations');
      if (res.ok) {
        const data = await res.json();
        setLocations(data.locations || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage('');

    try {
      const res = await fetch('/api/fleet/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: 'org-fleet-01',
          name,
          address,
          city,
          postalCode,
          operatingHours,
          contactPerson,
          contactNumber,
          pickupInstructions,
        }),
      });

      if (res.ok) {
        setStatusMessage('Operational hub added successfully.');
        setShowAddModal(false);
        // reset
        setName('');
        setAddress('');
        setPickupInstructions('');
        await fetchLocations();
      } else {
        const d = await res.json();
        setStatusMessage(`Error: ${d.error || 'Failed to add depot'}`);
      }
    } catch {
      setStatusMessage('Network failure creating depot location.');
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
            <Link
              href="/owner/fleet"
              className="text-xs font-bold text-brand-emerald hover:underline flex items-center gap-1 mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Fleet Command
            </Link>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-brand-navy">
              Operational Fleet Locations &amp; Depots
            </h1>
            <p className="text-xs sm:text-sm text-brand-text-muted">
              Configure physical handover hubs, operating windows, and customer pickup instructions.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-emerald hover:bg-brand-emerald-dark text-white shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Operational Hub</span>
          </button>
        </div>

        {statusMessage && (
          <div className="p-3 bg-brand-emerald-subtle border border-brand-emerald/30 text-brand-emerald text-xs rounded-2xl flex items-center justify-between">
            <span>{statusMessage}</span>
            <button onClick={() => setStatusMessage('')} className="font-bold">×</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((loc) => (
            <div
              key={loc.id}
              className="bg-white rounded-3xl border border-brand-border shadow-card p-6 space-y-4 hover:shadow-floating transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-brand-text-muted text-[10px]">{loc.id}</span>
                  <h3 className="text-base font-display font-bold text-brand-navy mt-0.5">
                    {loc.name}
                  </h3>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-surface text-brand-navy border border-brand-border">
                    {loc.city} · {loc.postalCode}
                  </span>
                </div>
                <div className="w-9 h-9 rounded-2xl bg-brand-emerald-subtle text-brand-emerald flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-2 text-xs text-brand-text-muted">
                <p className="line-clamp-2">{loc.address}</p>

                <div className="flex items-center gap-2 text-brand-navy font-medium pt-1">
                  <Clock className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
                  <span>Hours: {loc.operatingHours}</span>
                </div>

                <div className="flex items-center gap-2 text-brand-navy font-medium">
                  <User className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
                  <span>Manager: {loc.contactPerson} ({loc.contactNumber})</span>
                </div>
              </div>

              {loc.pickupInstructions && (
                <div className="p-3 rounded-2xl bg-brand-surface border border-brand-border text-[11px] text-brand-text-muted">
                  <strong className="text-brand-navy block mb-0.5">Pickup Protocol:</strong>
                  {loc.pickupInstructions}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Hub Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-floating border border-brand-border">
            <h3 className="text-lg font-display font-bold text-brand-navy">Add Fleet Operational Hub</h3>
            <form onSubmit={handleCreateLocation} className="space-y-3 text-xs">
              <div>
                <label className="block text-brand-text-muted mb-1 font-semibold">Hub / Depot Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Indiranagar Central Hub"
                  required
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-white"
                />
              </div>

              <div>
                <label className="block text-brand-text-muted mb-1 font-semibold">Full Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street and landmark"
                  required
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-brand-text-muted mb-1 font-semibold">City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-white"
                  >
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Goa">Goa</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Pune">Pune</option>
                    <option value="Jabalpur">Jabalpur</option>
                  </select>
                </div>
                <div>
                  <label className="block text-brand-text-muted mb-1 font-semibold">Postal Code</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-brand-text-muted mb-1 font-semibold">Contact Person</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Hub supervisor"
                    required
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-white"
                  />
                </div>
                <div>
                  <label className="block text-brand-text-muted mb-1 font-semibold">Contact Phone</label>
                  <input
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="+91..."
                    required
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-brand-text-muted mb-1 font-semibold">Operating Hours</label>
                <input
                  type="text"
                  value={operatingHours}
                  onChange={(e) => setOperatingHours(e.target.value)}
                  placeholder="e.g. 06:00 - 23:00 or 24 Hours"
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-white"
                />
              </div>

              <div>
                <label className="block text-brand-text-muted mb-1 font-semibold">Customer Pickup Instructions</label>
                <textarea
                  value={pickupInstructions}
                  onChange={(e) => setPickupInstructions(e.target.value)}
                  placeholder="e.g. Report to Bay 3 with government ID."
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-white"
                />
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
                  {isSubmitting ? 'Creating...' : 'Save Hub'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
