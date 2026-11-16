'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useMarketplace } from '@/context/MarketplaceContext';
import {
  ShieldAlert,
  AlertTriangle,
  PhoneCall,
  PlusCircle,
  Clock,
  CheckCircle2,
  Wrench,
  Car,
  X,
  ArrowLeft,
} from 'lucide-react';

export default function IncidentsPage() {
  const { currentUser } = useAuth();
  const { bookings } = useMarketplace();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [bookingId, setBookingId] = useState('');
  const [category, setCategory] = useState('BREAKDOWN');
  const [priority, setPriority] = useState('MEDIUM');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [emergencyContactUsed, setEmergencyContactUsed] = useState(false);

  const fetchIncidents = async () => {
    try {
      const res = await fetch('/api/incidents');
      if (res.ok) {
        const d = await res.json();
        setIncidents(d.incidents || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleReportIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage('');

    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE',
          bookingId: bookingId || null,
          category,
          priority,
          title,
          description,
          location,
          emergencyContactUsed,
        }),
      });

      if (res.ok) {
        setStatusMessage('Incident ticket filed. Assigned support team notified.');
        setShowReportModal(false);
        setTitle('');
        setDescription('');
        setLocation('');
        await fetchIncidents();
      } else {
        const d = await res.json();
        setStatusMessage(`Error: ${d.error || 'Failed to file report'}`);
      }
    } catch {
      setStatusMessage('Network failure submitting incident report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Banner */}
      <div className="bg-brand-navy text-white rounded-3xl p-6 sm:p-8 shadow-floating flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-400/30 mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>24/7 Roadside &amp; Emergency Escalation Protocol</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">
            Incident &amp; Road Safety Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Report breakdown, mechanical failure, accidents, theft, or severe trip delays.
          </p>
        </div>

        <button
          onClick={() => setShowReportModal(true)}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-danger hover:bg-red-700 text-white shadow-floating flex items-center gap-1.5 transition-colors shrink-0"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Report Live Incident</span>
        </button>
      </div>

      {/* Emergency Guide Card */}
      <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-start gap-3">
          <PhoneCall className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-brand-navy">Critical Safety &amp; Medical Emergencies</h4>
            <p className="text-brand-text-muted mt-0.5">
              In case of bodily injury, call emergency services immediately: <strong>112 (National Emergency Helpline)</strong> or <strong>108 (Ambulance)</strong>. Platform roadside support can be reached at <strong>1800-VAHAN-HELP (Simulated)</strong>.
            </p>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-brand-emerald-subtle border border-brand-emerald/30 text-brand-emerald text-xs rounded-2xl flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage('')} className="font-bold">×</button>
        </div>
      )}

      {/* Incidents List */}
      <div className="bg-white rounded-3xl border border-brand-border shadow-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-display font-bold text-brand-navy">Reported Incidents ({incidents.length})</h2>
          <span className="text-xs text-brand-text-muted">Recorded operational safety tickets</span>
        </div>

        {incidents.length === 0 ? (
          <div className="py-12 text-center text-xs text-brand-text-muted">
            Zero active incidents reported. All ongoing platform journeys operating smoothly.
          </div>
        ) : (
          <div className="divide-y divide-brand-border/60">
            {incidents.map((inc) => {
              const isResolved = inc.status === 'RESOLVED' || inc.status === 'CLOSED';
              const isCritical = inc.priority === 'CRITICAL' || inc.priority === 'HIGH';

              return (
                <div key={inc.id} className="py-4 space-y-2 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-brand-text-muted text-[10px]">{inc.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isCritical ? 'bg-red-100 text-brand-danger' : 'bg-brand-surface text-brand-navy'
                        }`}
                      >
                        {inc.priority} PRIORITY
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-brand-surface text-brand-navy">
                        {inc.category.replace('_', ' ')}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase self-start sm:self-auto ${
                        isResolved
                          ? 'bg-brand-emerald-subtle text-brand-emerald'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {inc.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-brand-navy">{inc.title}</h3>
                  <p className="text-brand-text-muted">{inc.description}</p>

                  {inc.location && (
                    <p className="text-[11px] text-brand-navy font-medium">
                      Location: <span className="text-brand-text-muted">{inc.location}</span>
                    </p>
                  )}

                  {inc.resolutionNotes && (
                    <div className="p-3 rounded-2xl bg-brand-surface border border-brand-border text-[11px] text-brand-navy">
                      <strong className="block text-brand-emerald mb-0.5">Support Team Resolution:</strong>
                      {inc.resolutionNotes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-floating border border-brand-border">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-display font-bold text-brand-navy">Report Journey Incident</h3>
              <button onClick={() => setShowReportModal(false)} className="text-brand-text-muted hover:text-brand-navy">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReportIncident} className="space-y-3 text-xs">
              <div>
                <label className="block text-brand-text-muted mb-1 font-semibold">Incident Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-white"
                >
                  <option value="BREAKDOWN">Vehicle Breakdown / Puncture</option>
                  <option value="ACCIDENT">Road Collision / Accident</option>
                  <option value="THEFT">Suspected Theft / Missing Vehicle</option>
                  <option value="DAMAGE">Physical Damage Discovered</option>
                  <option value="LATE_RETURN">Severe Handover Delay</option>
                  <option value="DRIVER_MISCONDUCT">Driver Misconduct</option>
                  <option value="SAFETY_EMERGENCY">Safety Emergency</option>
                  <option value="PAYMENT_DISPUTE">Payment / Tariff Dispute</option>
                </select>
              </div>

              <div>
                <label className="block text-brand-text-muted mb-1 font-semibold">Severity Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-white"
                >
                  <option value="LOW">Low (Minor delay / informational)</option>
                  <option value="MEDIUM">Medium (Requires road assistance)</option>
                  <option value="HIGH">High (Immobilized vehicle)</option>
                  <option value="CRITICAL">Critical (Safety hazard / emergency)</option>
                </select>
              </div>

              <div>
                <label className="block text-brand-text-muted mb-1 font-semibold">Incident Summary</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Engine overheating on highway"
                  required
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-brand-text-muted mb-1 font-semibold">Detailed Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe vehicle symptoms, passengers present, safety situation..."
                  rows={3}
                  required
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-white"
                />
              </div>

              <div>
                <label className="block text-brand-text-muted mb-1 font-semibold">Current Location / Landmark</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Highway mile marker, road, or city"
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 border border-brand-border rounded-xl text-brand-navy font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-brand-danger hover:bg-red-700 text-white font-bold rounded-xl shadow-sm"
                >
                  {isSubmitting ? 'Filing...' : 'Submit Emergency Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
