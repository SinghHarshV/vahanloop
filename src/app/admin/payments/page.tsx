'use client';

import React, { useState, useEffect } from 'react';
import { AdminNav } from '@/components/admin/AdminNav';
import {
  CreditCard,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  IndianRupee,
  Search,
} from 'lucide-react';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refundingPaymentId, setRefundingPaymentId] = useState<string | null>(null);
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [refundReason, setRefundReason] = useState<string>('');
  const [actionMessage, setActionMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const [txRes, rfRes] = await Promise.all([
        fetch('/api/admin/transactions', { credentials: 'include' }),
        fetch('/api/admin/refunds', { credentials: 'include' }),
      ]);
      if (txRes.ok) {
        const d = await txRes.json();
        setPayments(d.payments || []);
      }
      if (rfRes.ok) {
        const d = await rfRes.json();
        setRefunds(d.refunds || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleIssueRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundingPaymentId) return;
    setIsSubmitting(true);
    setActionMessage('');

    try {
      const res = await fetch('/api/admin/refunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          paymentId: refundingPaymentId,
          amountInr: refundAmount ? Number(refundAmount) : undefined,
          reason: refundReason || 'Admin approved cancellation refund',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setActionMessage('Test refund processed successfully.');
        setRefundingPaymentId(null);
        setRefundAmount('');
        setRefundReason('');
        await fetchTransactions();
      } else {
        setActionMessage(`Error: ${data.error || 'Refund failed'}`);
      }
    } catch {
      setActionMessage('Network error processing refund');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Payment &amp; Refund Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Supervise simulated transactions, verify digital receipts, and trigger test refunds.
          </p>
        </div>

        {actionMessage && (
          <div className="p-3 bg-purple-50 border border-purple-200 text-purple-900 text-xs rounded-xl flex items-center justify-between">
            <span>{actionMessage}</span>
            <button onClick={() => setActionMessage('')} className="font-bold ml-2">×</button>
          </div>
        )}

        {/* Transactions Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Transactions ({payments.length})
            </h2>
            <span className="text-[11px] bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
              Test Mode Only
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="pb-3">Reference</th>
                  <th className="pb-3">Booking</th>
                  <th className="pb-3">Provider</th>
                  <th className="pb-3">Method</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="py-2.5">
                    <td className="py-3 font-mono text-[11px] text-slate-700 font-bold">
                      {p.transactionReference || p.id}
                    </td>
                    <td className="py-3 font-mono text-[11px] text-slate-500">{p.bookingId}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 text-slate-800">
                        {p.provider || 'MOCK'}
                      </span>
                    </td>
                    <td className="py-3 font-semibold text-slate-700">{p.paymentMethod}</td>
                    <td className="py-3 font-bold text-slate-900">₹{p.amount?.toLocaleString('en-IN')}</td>
                    <td className="py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          p.paymentStatus === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.paymentStatus === 'REFUNDED'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {p.paymentStatus === 'COMPLETED' && (
                        <button
                          onClick={() => {
                            setRefundingPaymentId(p.id);
                            setRefundAmount(String(p.amount));
                          }}
                          className="px-3 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-bold text-[11px] transition-colors"
                        >
                          Issue Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Refunds Log */}
        {refunds.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Refunds History ({refunds.length})</h2>
            <div className="divide-y divide-slate-100 text-xs">
              {refunds.map((rf) => (
                <div key={rf.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-slate-400 text-[10px]">{rf.providerRefundId}</span>
                    <p className="font-semibold text-slate-800">{rf.reason || 'Refund'}</p>
                    <span className="text-[11px] text-slate-400">
                      {new Date(rf.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-rose-700">
                      -{rf.formattedAmount || `₹${rf.amountPaise / 100}`}
                    </span>
                    <p className="text-[10px] uppercase font-bold text-emerald-700">{rf.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Refund Modal */}
      {refundingPaymentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 border border-slate-200 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Initiate Test Refund</h3>
            <form onSubmit={handleIssueRefund} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Refund Amount (₹)</label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-slate-800 font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Reason</label>
                <input
                  type="text"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g. Host cancelled booking"
                  className="w-full px-3 py-2 border rounded-lg text-slate-800"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRefundingPaymentId(null)}
                  className="flex-1 py-2 rounded-xl border text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 disabled:opacity-60"
                >
                  {isSubmitting ? 'Processing...' : 'Confirm Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
