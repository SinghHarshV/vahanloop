'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminNav } from '@/components/admin/AdminNav';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  Building2,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck2,
  Check,
  X,
  Eye,
  PlusCircle,
  FileText,
  Calendar,
  Wrench,
  Search,
  RotateCcw,
} from 'lucide-react';

export default function AdminOperationsHubPage() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'verifications' | 'compliance' | 'expiry' | 'drivers' | 'incidents' | 'support' | 'audit'>('verifications');

  // Data states
  const [applications, setApplications] = useState<any[]>([]);
  const [organisations, setOrganisations] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [ruleVersions, setRuleVersions] = useState<any[]>([]);
  const [expiryAlerts, setExpiryAlerts] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [driverAssignments, setDriverAssignments] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);

  // Action states
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [actionReason, setActionReason] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Rule Modal
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [ruleState, setRuleState] = useState('KARNATAKA');
  const [ruleCat, setRuleCat] = useState('CAR');
  const [ruleModel, setRuleModel] = useState('SELF_DRIVE');
  const [ruleDocs, setRuleDocs] = useState('RC,INSURANCE,PUC');
  const [rulePermits, setRulePermits] = useState('RENT_A_CAB');
  const [ruleNotes, setRuleNotes] = useState('');

  const loadAllData = async () => {
    try {
      const [vRes, cRes, eRes, dRes, daRes, iRes, tRes] = await Promise.all([
        fetch('/api/admin/verifications'),
        fetch('/api/compliance/rules'),
        fetch('/api/expiry/check'),
        fetch('/api/drivers'),
        fetch('/api/drivers/assignments'),
        fetch('/api/incidents'),
        fetch('/api/support/tickets'),
      ]);

      if (vRes.ok) {
        const d = await vRes.json();
        setApplications(d.applications || []);
        setOrganisations(d.organisations || []);
        setRecentReviews(d.recentReviews || []);
      }
      if (cRes.ok) {
        const d = await cRes.json();
        setRules(d.rules || []);
        setRuleVersions(d.versions || []);
      }
      if (eRes.ok) {
        const d = await eRes.json();
        setExpiryAlerts(d.alerts || []);
      }
      if (dRes.ok) {
        const d = await dRes.json();
        setDrivers(d.drivers || []);
      }
      if (daRes.ok) {
        const d = await daRes.json();
        setDriverAssignments(d.assignments || []);
      }
      if (iRes.ok) {
        const d = await iRes.json();
        setIncidents(d.incidents || []);
      }
      if (tRes.ok) {
        const d = await tRes.json();
        setTickets(d.tickets || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleVerificationAction = async (appId: string, action: 'APPROVE' | 'REJECT' | 'REQUEST_INFO' | 'SUSPEND') => {
    if (!actionReason) {
      alert('A documented administrative reason is mandatory for this compliance action.');
      return;
    }
    setIsSubmitting(true);
    setActionMessage('');

    try {
      const res = await fetch('/api/admin/verifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: appId,
          action,
          reason: actionReason,
          entityType: 'OWNER',
        }),
      });

      const d = await res.json();
      if (res.ok) {
        setActionMessage(`Action ${action} executed successfully. Audit trail recorded.`);
        setSelectedApp(null);
        setActionReason('');
        await loadAllData();
      } else {
        setActionMessage(`Error: ${d.error || 'Failed to update'}`);
      }
    } catch {
      setActionMessage('Network error updating verification.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setActionMessage('');

    try {
      const res = await fetch('/api/compliance/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ruleId: `RULE-${ruleState.slice(0, 2)}-${ruleCat}-${ruleModel}`,
          jurisdictionState: ruleState,
          vehicleCategory: ruleCat,
          rentalModel: ruleModel,
          requiredDocuments: ruleDocs,
          requiredPermits: rulePermits,
          reviewerNotes: ruleNotes,
          changeSummary: 'Admin policy configuration updated',
        }),
      });

      if (res.ok) {
        setActionMessage('Compliance rule saved and versioned.');
        setShowRuleModal(false);
        await loadAllData();
      } else {
        const d = await res.json();
        setActionMessage(`Error: ${d.error || 'Failed'}`);
      }
    } catch {
      setActionMessage('Network failure saving rule.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Banner */}
        <div className="bg-brand-navy text-white rounded-3xl p-6 sm:p-8 shadow-floating flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-brand-emerald-accent border border-white/15 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-emerald" />
              <span>Pilot Operations &amp; Legal Compliance Control</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">
              Operational Command &amp; Compliance Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Supervise host identity verification, state transport scheme rules, driver assignments, and safety incidents.
            </p>
          </div>

          <div className="bg-white/10 px-4 py-2 rounded-2xl border border-white/15 text-xs text-right">
            <span className="text-slate-300 block">Logged Officer:</span>
            <span className="font-bold text-white">{currentUser?.fullName || 'Super Administrator'}</span>
          </div>
        </div>

        {actionMessage && (
          <div className="p-3 bg-brand-emerald-subtle border border-brand-emerald/30 text-brand-emerald text-xs rounded-2xl flex items-center justify-between">
            <span>{actionMessage}</span>
            <button onClick={() => setActionMessage('')} className="font-bold">×</button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex gap-1.5 border-b border-brand-border pb-2 overflow-x-auto custom-scrollbar text-xs font-bold">
          <button
            onClick={() => setActiveTab('verifications')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'verifications'
                ? 'bg-brand-navy text-white shadow-sm'
                : 'text-brand-text-muted hover:text-brand-navy hover:bg-brand-surface'
            }`}
          >
            Owner Verifications ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'compliance'
                ? 'bg-brand-navy text-white shadow-sm'
                : 'text-brand-text-muted hover:text-brand-navy hover:bg-brand-surface'
            }`}
          >
            Compliance Engine Rules ({rules.length})
          </button>
          <button
            onClick={() => setActiveTab('expiry')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'expiry'
                ? 'bg-brand-navy text-white shadow-sm'
                : 'text-brand-text-muted hover:text-brand-navy hover:bg-brand-surface'
            }`}
          >
            Document Expiry ({expiryAlerts.length})
          </button>
          <button
            onClick={() => setActiveTab('drivers')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'drivers'
                ? 'bg-brand-navy text-white shadow-sm'
                : 'text-brand-text-muted hover:text-brand-navy hover:bg-brand-surface'
            }`}
          >
            Commercial Drivers ({drivers.length})
          </button>
          <button
            onClick={() => setActiveTab('incidents')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'incidents'
                ? 'bg-brand-navy text-white shadow-sm'
                : 'text-brand-text-muted hover:text-brand-navy hover:bg-brand-surface'
            }`}
          >
            Safety Incidents ({incidents.length})
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'support'
                ? 'bg-brand-navy text-white shadow-sm'
                : 'text-brand-text-muted hover:text-brand-navy hover:bg-brand-surface'
            }`}
          >
            Support Tickets ({tickets.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'audit'
                ? 'bg-brand-navy text-white shadow-sm'
                : 'text-brand-text-muted hover:text-brand-navy hover:bg-brand-surface'
            }`}
          >
            Audit Log ({recentReviews.length})
          </button>
        </div>

        {/* TAB 1: OWNER & BUSINESS VERIFICATIONS */}
        {activeTab === 'verifications' && (
          <div className="bg-white rounded-3xl border border-brand-border shadow-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-display font-bold text-brand-navy">Owner KYC &amp; Payout Applications</h3>
                <p className="text-xs text-brand-text-muted">Review submitted host identity tokens and bank payout setups.</p>
              </div>
            </div>

            <div className="divide-y divide-brand-border/60">
              {applications.map((app) => (
                <div key={app.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-brand-text-muted text-[10px]">{app.id}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-brand-surface text-brand-navy border border-brand-border">
                        {app.ownerType}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          app.status === 'VERIFIED'
                            ? 'bg-brand-emerald-subtle text-brand-emerald'
                            : app.status === 'REJECTED'
                            ? 'bg-red-100 text-brand-danger'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-brand-navy">{app.fullName} ({app.email})</h4>
                    <p className="text-brand-text-muted">
                      Mobile: {app.mobile} · ID Method: <strong>{app.idVerificationMethod || 'VOTER_ID'}</strong> · Token: <span className="font-mono">{app.idVerificationRef || 'SYN-KA-8811'}</span>
                    </p>
                    <p className="text-brand-text-muted">
                      Bank Beneficiary: <strong>{app.bankAccountHolder || app.fullName}</strong> · Payout: {app.payoutEligible ? 'Enabled' : 'Pending'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedApp(app);
                        setActionReason('Verified official KYC credentials and bank payout IFSC routing.');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-brand-surface hover:bg-slate-200/60 text-brand-navy border border-brand-border font-bold flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review Details</span>
                    </button>

                    {app.status !== 'VERIFIED' && (
                      <button
                        onClick={() => {
                          setActionReason('Approved by compliance officer.');
                          handleVerificationAction(app.id, 'APPROVE');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold flex items-center gap-1 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Quick Approve</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: COMPLIANCE ENGINE RULES */}
        {activeTab === 'compliance' && (
          <div className="bg-white rounded-3xl border border-brand-border shadow-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-display font-bold text-brand-navy">Configurable State Compliance Rules</h3>
                <p className="text-xs text-brand-text-muted">
                  Parameters enforced by VahanLoop before any vehicle can become published and bookable.
                </p>
              </div>
              <button
                onClick={() => setShowRuleModal(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-emerald hover:bg-brand-emerald-dark text-white flex items-center gap-1.5 shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Configure Rule</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {rules.map((r) => (
                <div key={r.id} className="p-4 rounded-2xl bg-brand-surface border border-brand-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-brand-text-muted text-[10px]">{r.ruleId}</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-brand-emerald-subtle text-brand-emerald">
                      v{r.version} · {r.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-brand-navy text-sm">
                    {r.jurisdictionState} · {r.vehicleCategory} ({r.rentalModel.replace('_', ' ')})
                  </h4>

                  <p className="text-brand-text-muted">
                    Mandatory Documents: <strong className="text-brand-navy">{r.requiredDocuments}</strong>
                  </p>
                  {r.requiredPermits && (
                    <p className="text-brand-text-muted">
                      Required Scheme Permits: <strong className="text-brand-navy">{r.requiredPermits}</strong>
                    </p>
                  )}
                  <p className="text-[11px] text-brand-navy font-mono">Ref: {r.sourceReference}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DOCUMENT EXPIRY DASHBOARD */}
        {activeTab === 'expiry' && (
          <div className="bg-white rounded-3xl border border-brand-border shadow-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-display font-bold text-brand-navy">Central Document Expiry Monitor</h3>
                <p className="text-xs text-brand-text-muted">
                  Automated scan of vehicle RC, commercial insurance, PUC, and driver licence expiration dates.
                </p>
              </div>
            </div>

            {expiryAlerts.length === 0 ? (
              <p className="py-8 text-center text-xs text-brand-text-muted">All documents are within valid compliance periods.</p>
            ) : (
              <div className="divide-y divide-brand-border/60">
                {expiryAlerts.map((al, idx) => {
                  const isExp = al.severity === 'EXPIRED';
                  const isCrit = al.severity === 'CRITICAL';

                  return (
                    <div key={idx} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              isExp
                                ? 'bg-red-100 text-brand-danger'
                                : isCrit
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-brand-surface text-brand-navy'
                            }`}
                          >
                            {isExp ? 'EXPIRED' : `${al.daysRemaining} DAYS REMAINING`}
                          </span>
                          <span className="font-bold text-brand-navy">{al.entityType}: {al.entityName}</span>
                        </div>
                        <p className="text-brand-text-muted">
                          Document: <strong className="text-brand-navy">{al.documentType}</strong> · Expiry: {new Date(al.expiryDate).toLocaleDateString()}
                        </p>
                        <p className="text-[11px] text-brand-danger font-medium">{al.impact}</p>
                      </div>

                      <span className="text-[10px] font-mono px-3 py-1 rounded-xl bg-brand-surface border border-brand-border text-brand-text-muted">
                        Notification Sent
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: COMMERCIAL DRIVERS ROSTER */}
        {activeTab === 'drivers' && (
          <div className="bg-white rounded-3xl border border-brand-border shadow-card p-6 space-y-4">
            <h3 className="text-lg font-display font-bold text-brand-navy">Commercial Chauffeur Roster ({drivers.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {drivers.map((d) => (
                <div key={d.id} className="p-4 rounded-2xl bg-brand-surface border border-brand-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-brand-text-muted text-[10px]">{d.id}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-brand-emerald-subtle text-brand-emerald">
                      {d.availabilityStatus}
                    </span>
                  </div>
                  <h4 className="font-bold text-brand-navy text-sm">{d.fullName}</h4>
                  <p className="text-brand-text-muted">Class: {d.licenceCategory} · {d.licenceNumber}</p>
                  <p className="text-brand-text-muted">Trips: {d.totalTrips || 0} · ⭐ {d.rating || '5.0'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SAFETY INCIDENTS */}
        {activeTab === 'incidents' && (
          <div className="bg-white rounded-3xl border border-brand-border shadow-card p-6 space-y-4">
            <h3 className="text-lg font-display font-bold text-brand-navy">Reported Incidents ({incidents.length})</h3>
            <div className="divide-y divide-brand-border/60">
              {incidents.map((inc) => (
                <div key={inc.id} className="py-3.5 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-brand-text-muted text-[10px]">{inc.id}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-100 text-brand-danger">
                        {inc.priority} PRIORITY
                      </span>
                      <span className="font-bold text-brand-navy">{inc.title}</span>
                    </div>
                    <span className="font-bold uppercase text-brand-navy text-[10px]">{inc.status}</span>
                  </div>
                  <p className="text-brand-text-muted">{inc.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: SUPPORT TICKETS */}
        {activeTab === 'support' && (
          <div className="bg-white rounded-3xl border border-brand-border shadow-card p-6 space-y-4">
            <h3 className="text-lg font-display font-bold text-brand-navy">Support Tickets ({tickets.length})</h3>
            <div className="divide-y divide-brand-border/60">
              {tickets.map((t) => (
                <div key={t.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono text-brand-text-muted text-[10px]">{t.ticketNumber}</span>
                    <h4 className="font-bold text-brand-navy">{t.subject}</h4>
                    <p className="text-brand-text-muted text-[11px]">{t.description}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-brand-surface text-brand-navy border border-brand-border">
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: ADMINISTRATIVE AUDIT LOG */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-3xl border border-brand-border shadow-card p-6 space-y-4">
            <h3 className="text-lg font-display font-bold text-brand-navy">Administrative Decisions Audit Trail</h3>
            <div className="divide-y divide-brand-border/60 text-xs">
              {recentReviews.map((rev) => (
                <div key={rev.id} className="py-3 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-brand-navy">Action: {rev.action} ({rev.entityType})</span>
                    <span className="text-brand-text-muted">{new Date(rev.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-brand-text-muted">
                    Entity ID: <span className="font-mono">{rev.entityId}</span> · Status: {rev.previousStatus || 'NEW'} → <strong>{rev.newStatus}</strong>
                  </p>
                  <p className="text-brand-navy bg-brand-surface p-2 rounded-xl text-[11px]">
                    Documented Reason: {rev.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-floating border border-brand-border">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-display font-bold text-brand-navy">
                Review Host Verification: {selectedApp.fullName}
              </h3>
              <button onClick={() => setSelectedApp(null)} className="text-brand-text-muted hover:text-brand-navy">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-brand-text-muted bg-brand-surface p-3.5 rounded-2xl border border-brand-border">
              <div>Type: <strong className="text-brand-navy">{selectedApp.ownerType}</strong></div>
              <div>Mobile: <strong className="text-brand-navy">{selectedApp.mobile}</strong></div>
              <div>ID Method: <strong className="text-brand-navy">{selectedApp.idVerificationMethod}</strong></div>
              <div>Ref Token: <strong className="text-brand-navy font-mono">{selectedApp.idVerificationRef}</strong></div>
              <div>Bank Beneficiary: <strong className="text-brand-navy">{selectedApp.bankAccountHolder}</strong></div>
              <div>Terms Version: <strong className="text-brand-navy">{selectedApp.termsVersion} (Accepted)</strong></div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-navy mb-1">
                Documented Administrative Reason (Mandatory for Audit Trail)
              </label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="State basis for decision (e.g. Valid identity credentials and bank KYC confirmed)..."
                rows={2}
                required
                className="w-full p-2.5 rounded-xl border border-brand-border bg-white text-xs text-brand-navy"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleVerificationAction(selectedApp.id, 'REJECT')}
                disabled={isSubmitting}
                className="flex-1 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-brand-danger font-bold text-xs"
              >
                Reject Application
              </button>
              <button
                type="button"
                onClick={() => handleVerificationAction(selectedApp.id, 'SUSPEND')}
                disabled={isSubmitting}
                className="flex-1 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-xs"
              >
                Suspend Account
              </button>
              <button
                type="button"
                onClick={() => handleVerificationAction(selectedApp.id, 'APPROVE')}
                disabled={isSubmitting}
                className="flex-1 py-2 rounded-xl bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold text-xs shadow-sm"
              >
                Approve &amp; Enable Payouts
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Configure Rule Modal */}
      {showRuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-floating border border-brand-border">
            <h3 className="text-base font-display font-bold text-brand-navy">Configure Compliance Policy</h3>
            <form onSubmit={handleCreateRule} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-brand-text-muted mb-1 font-semibold">Jurisdiction State</label>
                  <select
                    value={ruleState}
                    onChange={(e) => setRuleState(e.target.value)}
                    className="w-full p-2 rounded-xl border border-brand-border bg-white"
                  >
                    <option value="KARNATAKA">Karnataka</option>
                    <option value="MAHARASHTRA">Maharashtra</option>
                    <option value="DELHI">Delhi NCR</option>
                    <option value="GOA">Goa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-brand-text-muted mb-1 font-semibold">Vehicle Category</label>
                  <select
                    value={ruleCat}
                    onChange={(e) => setRuleCat(e.target.value)}
                    className="w-full p-2 rounded-xl border border-brand-border bg-white"
                  >
                    <option value="CAR">Car</option>
                    <option value="BIKE">Bike</option>
                    <option value="SCOOTER">Scooter</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-brand-text-muted mb-1 font-semibold">Rental Arrangement Model</label>
                <select
                  value={ruleModel}
                  onChange={(e) => setRuleModel(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-white"
                >
                  <option value="SELF_DRIVE">Self-Drive Rental</option>
                  <option value="CHAUFFEUR">Chauffeur-Driven Rental</option>
                </select>
              </div>

              <div>
                <label className="block text-brand-text-muted mb-1 font-semibold">Mandatory Documents</label>
                <input
                  type="text"
                  value={ruleDocs}
                  onChange={(e) => setRuleDocs(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-brand-text-muted mb-1 font-semibold">Required Scheme Permits</label>
                <input
                  type="text"
                  value={rulePermits}
                  onChange={(e) => setRulePermits(e.target.value)}
                  placeholder="e.g. RENT_A_CAB, ALL_INDIA_TOURIST_PERMIT"
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-brand-text-muted mb-1 font-semibold">Legal Reference &amp; Notes</label>
                <textarea
                  value={ruleNotes}
                  onChange={(e) => setRuleNotes(e.target.value)}
                  placeholder="e.g. Motor Vehicles Act 1988 Section 75 provisions..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRuleModal(false)}
                  className="px-4 py-2 border border-brand-border rounded-xl text-brand-navy font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold rounded-xl shadow-sm"
                >
                  {isSubmitting ? 'Saving...' : 'Save & Version Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
