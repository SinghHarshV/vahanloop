'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Car,
  CheckCircle2,
  Clock,
  Navigation,
  ShieldCheck,
  Phone,
  MapPin,
  Calendar,
  AlertTriangle,
  Play,
  CheckSquare,
  X,
} from 'lucide-react';

export default function DriverPortalPage() {
  const { currentUser } = useAuth();
  const [driverProfile, setDriverProfile] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [odometerInput, setOdometerInput] = useState('24500');
  const [activeModal, setActiveModal] = useState<{ type: 'START' | 'COMPLETE'; assignmentId: string } | null>(null);

  const fetchDriverData = async () => {
    try {
      const [dRes, aRes] = await Promise.all([
        fetch('/api/drivers'),
        fetch('/api/drivers/assignments'),
      ]);
      if (dRes.ok) {
        const d = await dRes.json();
        // find profile for currentUser or fallback to drv-01 demo driver
        const profile = d.drivers?.find((drv: any) => drv.userId === currentUser?.id) || d.drivers?.[0];
        setDriverProfile(profile);

        if (aRes.ok && profile) {
          const a = await aRes.json();
          const myAssignments = (a.assignments || []).filter((item: any) => item.driverId === profile.id);
          setAssignments(myAssignments);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriverData();
  }, [currentUser]);

  const handleToggleDuty = async (newStatus: string) => {
    if (!driverProfile) return;
    try {
      const res = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TOGGLE_AVAILABILITY',
          driverId: driverProfile.id,
          status: newStatus,
        }),
      });
      if (res.ok) {
        setStatusMessage(`Duty status updated to ${newStatus}`);
        await fetchDriverData();
      }
    } catch {
      setStatusMessage('Failed to update status');
    }
  };

  const handleTripAction = async (assignmentId: string, status: string, odo?: number) => {
    try {
      const res = await fetch('/api/drivers/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_STATUS',
          assignmentId,
          status,
          odometer: odo,
        }),
      });
      if (res.ok) {
        setStatusMessage(`Trip status updated: ${status}`);
        setActiveModal(null);
        await fetchDriverData();
      }
    } catch {
      setStatusMessage('Failed to update trip assignment');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-brand-text-muted">
        Loading driver operational portal...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Driver Header Banner */}
      <div className="bg-brand-navy text-white rounded-3xl p-6 sm:p-8 shadow-floating flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-brand-emerald-accent border border-white/15 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-emerald" />
            <span>Commercial Chauffeur Cockpit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">
            Driver Command &amp; Duty Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Welcome, <strong>{driverProfile?.fullName || 'Commercial Driver'}</strong> ({driverProfile?.licenceCategory})
          </p>
        </div>

        {/* Duty Toggle Pill */}
        <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/15 flex items-center gap-1">
          <button
            onClick={() => handleToggleDuty('AVAILABLE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              driverProfile?.availabilityStatus === 'AVAILABLE'
                ? 'bg-brand-emerald text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Available
          </button>
          <button
            onClick={() => handleToggleDuty('UNAVAILABLE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              driverProfile?.availabilityStatus === 'UNAVAILABLE'
                ? 'bg-brand-danger text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Off Duty
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-brand-emerald-subtle border border-brand-emerald/30 text-brand-emerald text-xs rounded-2xl flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage('')} className="font-bold">×</button>
        </div>
      )}

      {/* Driver Credential Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-3xl border border-brand-border shadow-card space-y-1">
          <span className="text-[10px] font-bold text-brand-text-muted uppercase">Licence Status</span>
          <p className="text-sm font-bold text-brand-emerald flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Verified
          </p>
          <p className="text-[11px] font-mono text-brand-text-muted">{driverProfile?.licenceNumber || 'KA-01-2015000'}</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-brand-border shadow-card space-y-1">
          <span className="text-[10px] font-bold text-brand-text-muted uppercase">Background Screening</span>
          <p className="text-sm font-bold text-brand-emerald flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" /> Cleared
          </p>
          <p className="text-[11px] text-brand-text-muted">Police Verification Active</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-brand-border shadow-card space-y-1">
          <span className="text-[10px] font-bold text-brand-text-muted uppercase">Guest Rating</span>
          <p className="text-sm font-bold text-brand-navy">⭐ {driverProfile?.rating || '4.9'} / 5.0</p>
          <p className="text-[11px] text-brand-text-muted">5-Star Standards</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-brand-border shadow-card space-y-1">
          <span className="text-[10px] font-bold text-brand-text-muted uppercase">Assigned Trips</span>
          <p className="text-sm font-bold text-brand-navy">{assignments.length}</p>
          <p className="text-[11px] text-brand-text-muted">Platform reservations</p>
        </div>
      </div>

      {/* Assigned Trips Ledger */}
      <div className="bg-white rounded-3xl border border-brand-border shadow-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-display font-bold text-brand-navy">Assigned Chauffeur Reservations</h2>
          <span className="text-xs text-brand-text-muted">Real-time GPS trip execution</span>
        </div>

        {assignments.length === 0 ? (
          <div className="py-12 text-center text-xs text-brand-text-muted">
            No active chauffeur assignments scheduled. Maintain duty availability to receive customer trips.
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((a) => {
              const bk = a.booking;
              const isAssigned = a.status === 'ASSIGNED';
              const isStarted = a.status === 'STARTED';
              const isCompleted = a.status === 'COMPLETED';

              return (
                <div
                  key={a.id}
                  className="p-5 rounded-2xl bg-brand-surface border border-brand-border space-y-4 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-brand-border/60">
                    <div>
                      <span className="font-mono text-brand-text-muted text-[10px]">{a.id}</span>
                      <h4 className="text-sm font-bold text-brand-navy">
                        {bk?.vehicleTitle || 'Executive Sedan Chauffeur Trip'}
                      </h4>
                      <p className="text-brand-text-muted">
                        Guest: <strong>{bk?.customerName || 'Rahul Sharma'}</strong> · Contact: +919876543210
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase self-start sm:self-auto ${
                        isCompleted
                          ? 'bg-brand-emerald-subtle text-brand-emerald'
                          : isStarted
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {a.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-brand-text-muted">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-emerald" />
                      <span>Pickup: {bk?.pickupLocation || 'Indiranagar Central Hub'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-brand-emerald" />
                      <span>Schedule: {bk?.startDate || 'Today'} → {bk?.endDate || 'Tomorrow'}</span>
                    </div>
                  </div>

                  {a.notes && (
                    <div className="p-2.5 rounded-xl bg-white border border-brand-border text-[11px] text-brand-navy">
                      <strong>Host Note:</strong> {a.notes}
                    </div>
                  )}

                  {/* Driver Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    {isAssigned && (
                      <>
                        <button
                          onClick={() => handleTripAction(a.id, 'REJECTED')}
                          className="px-3 py-1.5 rounded-xl border border-brand-border text-brand-danger hover:bg-red-50 font-semibold"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleTripAction(a.id, 'ACCEPTED')}
                          className="px-4 py-1.5 rounded-xl bg-brand-navy hover:bg-brand-navy-light text-white font-bold shadow-sm"
                        >
                          Accept Trip
                        </button>
                      </>
                    )}

                    {a.status === 'ACCEPTED' && (
                      <button
                        onClick={() => setActiveModal({ type: 'START', assignmentId: a.id })}
                        className="px-4 py-1.5 rounded-xl bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold shadow-sm flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Start Trip (Record Odometer)</span>
                      </button>
                    )}

                    {isStarted && (
                      <button
                        onClick={() => setActiveModal({ type: 'COMPLETE', assignmentId: a.id })}
                        className="px-4 py-1.5 rounded-xl bg-brand-navy hover:bg-brand-navy-light text-white font-bold shadow-sm flex items-center gap-1.5"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Complete Trip</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Odometer Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-floating border border-brand-border">
            <h3 className="text-base font-display font-bold text-brand-navy">
              {activeModal.type === 'START' ? 'Start Trip Handover' : 'Complete Trip Verification'}
            </h3>
            <p className="text-xs text-brand-text-muted">
              Enter the verified dashboard odometer reading (in km):
            </p>
            <div>
              <input
                type="number"
                value={odometerInput}
                onChange={(e) => setOdometerInput(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-surface font-mono font-bold text-brand-navy text-sm"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 border border-brand-border rounded-xl text-xs font-semibold text-brand-navy"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleTripAction(
                    activeModal.assignmentId,
                    activeModal.type === 'START' ? 'STARTED' : 'COMPLETED',
                    Number(odometerInput)
                  )
                }
                className="px-5 py-2 bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold rounded-xl text-xs shadow-sm"
              >
                Confirm Reading
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
