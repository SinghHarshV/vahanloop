'use client';

import React, { useState, useEffect } from 'react';
import { AdminNav } from '@/components/admin/AdminNav';
import { useMarketplace } from '@/context/MarketplaceContext';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Check,
  X,
  AlertTriangle,
  FileText,
} from 'lucide-react';

export default function AdminDocumentsPage() {
  const { vehicles } = useMarketplace();
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('Expired or illegible document');
  const [actionMessage, setActionMessage] = useState<string>('');
  const [eligibilityData, setEligibilityData] = useState<Record<string, any>>({});

  useEffect(() => {
    // Fetch eligibility for all vehicles
    vehicles.forEach(async (v) => {
      try {
        const res = await fetch(`/api/vehicles/${v.id}/eligibility`, { credentials: 'include' });
        if (res.ok) {
          const d = await res.json();
          setEligibilityData((prev) => ({ ...prev, [v.id]: d }));
        }
      } catch {
        // ignore
      }
    });
  }, [vehicles]);

  const handleReview = async (docId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      const res = await fetch(`/api/documents/${docId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action, reason }),
      });
      if (res.ok) {
        setActionMessage(`Document ${action}d successfully`);
        setRejectingDocId(null);
      }
    } catch {
      setActionMessage('Failed to submit review');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Document Verification &amp; Vehicle Eligibility
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Perform administrative review of vehicle RC, Insurance, and PUC certificates.
          </p>
        </div>

        {actionMessage && (
          <div className="p-3 bg-purple-50 border border-purple-200 text-purple-900 text-xs rounded-xl flex items-center justify-between">
            <span>{actionMessage}</span>
            <button onClick={() => setActionMessage('')} className="font-bold ml-2">×</button>
          </div>
        )}

        <div className="space-y-6">
          {vehicles.map((v) => {
            const elig = eligibilityData[v.id];

            return (
              <div key={v.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <span className="font-mono text-slate-400 text-[10px]">{v.id}</span>
                    <h3 className="text-base font-bold text-slate-900">{v.title}</h3>
                    <p className="text-xs text-slate-500">
                      Host: <strong>{v.ownerName}</strong> ({v.ownerEmail}) · {v.location}
                    </p>
                  </div>

                  {elig && (
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${
                          elig.isEligible
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {elig.isEligible ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {elig.isEligible ? 'Marketplace Eligible' : 'Eligibility Incomplete'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Eligibility Checklist */}
                {elig?.checklist && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${elig.checklist.ownerVerified ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 text-slate-500'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Owner Verified</span>
                    </div>
                    <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${elig.checklist.hasApprovedRC ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>RC Document</span>
                    </div>
                    <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${elig.checklist.hasApprovedInsurance ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>Insurance Policy</span>
                    </div>
                    <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${elig.checklist.documentsNotExpired ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                      <Clock className="w-3.5 h-3.5" />
                      <span>Valid Validity</span>
                    </div>
                  </div>
                )}

                {/* Document Submissions List */}
                <div className="pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Submitted Compliance Documents
                  </h4>
                  <div className="space-y-2">
                    {['RC', 'INSURANCE', 'PUC'].map((docType) => (
                      <div
                        key={docType}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-slate-500" />
                          <div>
                            <span className="font-bold text-slate-800">{docType} Certificate</span>
                            <span className="ml-2 text-[10px] text-slate-400 font-mono">
                              Synthetic Demonstration File
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleReview(`${v.id}_${docType}`, 'approve')}
                            className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[10px] hover:bg-emerald-700 transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" /> Approve
                          </button>
                          <button
                            onClick={() => setRejectingDocId(`${v.id}_${docType}`)}
                            className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-bold text-[10px] transition-colors flex items-center gap-1"
                          >
                            <X className="w-3 h-3" /> Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reject Reason Modal */}
      {rejectingDocId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 border border-slate-200 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Reject Document Submission</h3>
            <div className="space-y-2 text-xs">
              <label className="block text-slate-600 font-semibold">Rejection Reason</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-2.5 border rounded-xl text-slate-800"
                rows={3}
                required
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setRejectingDocId(null)}
                className="flex-1 py-2 rounded-xl border text-slate-600 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReview(rejectingDocId, 'reject', rejectReason)}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
