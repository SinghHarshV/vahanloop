'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  MessageSquare,
  PlusCircle,
  Clock,
  CheckCircle2,
  Send,
  User,
  ShieldCheck,
  X,
  FileText,
} from 'lucide-react';

export default function SupportDeskPage() {
  const { currentUser } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Form State
  const [category, setCategory] = useState('BOOKING');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/support/tickets');
      if (res.ok) {
        const d = await res.json();
        setTickets(d.tickets || []);
        if (selectedTicket) {
          const updated = d.tickets?.find((t: any) => t.id === selectedTicket.id);
          if (updated) setSelectedTicket(updated);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [currentUser]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage('');

    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE',
          category,
          subject,
          description,
          priority,
        }),
      });

      if (res.ok) {
        setStatusMessage('Support ticket created. Our team will review shortly.');
        setShowCreateModal(false);
        setSubject('');
        setDescription('');
        await fetchTickets();
      } else {
        const d = await res.json();
        setStatusMessage(`Error: ${d.error || 'Failed to create ticket'}`);
      }
    } catch {
      setStatusMessage('Network failure submitting ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !newMessage.trim()) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_MESSAGE',
          ticketId: selectedTicket.id,
          message: newMessage.trim(),
        }),
      });

      if (res.ok) {
        setNewMessage('');
        await fetchTickets();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Banner */}
      <div className="bg-brand-navy text-white rounded-3xl p-6 sm:p-8 shadow-floating flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-brand-emerald-accent border border-white/15 mb-1">
            <MessageSquare className="w-3.5 h-3.5 text-brand-emerald" />
            <span>Dedicated Resolution &amp; Help Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">
            Customer &amp; Host Support Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Submit inquiries, track booking modifications, payment reconciliations, and platform feedback.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-emerald hover:bg-brand-emerald-dark text-white shadow-sm flex items-center gap-1.5 transition-colors shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Support Ticket</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-3 bg-brand-emerald-subtle border border-brand-emerald/30 text-brand-emerald text-xs rounded-2xl flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage('')} className="font-bold">×</button>
        </div>
      )}

      {/* Main Grid: Ticket List + Message Conversation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Tickets List */}
        <div className="bg-white rounded-3xl border border-brand-border shadow-card p-5 space-y-3">
          <h3 className="font-display font-bold text-brand-navy text-base">Your Support Tickets</h3>
          {tickets.length === 0 ? (
            <p className="text-xs text-brand-text-muted py-8 text-center">Zero active tickets raised.</p>
          ) : (
            <div className="space-y-2">
              {tickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                const isResolved = t.status === 'RESOLVED' || t.status === 'CLOSED';

                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all text-xs space-y-1 ${
                      isSelected
                        ? 'bg-brand-emerald-subtle border-brand-emerald/40 ring-1 ring-brand-emerald'
                        : 'border-brand-border hover:bg-brand-surface'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-brand-text-muted text-[10px]">{t.ticketNumber}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          isResolved ? 'bg-brand-emerald-subtle text-brand-emerald' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-brand-navy line-clamp-1">{t.subject}</h4>
                    <p className="text-brand-text-muted text-[11px] line-clamp-1">{t.description}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Selected Ticket Thread */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-brand-border shadow-card p-6 flex flex-col justify-between min-h-[480px]">
          {selectedTicket ? (
            <div className="space-y-4 flex flex-col h-full justify-between">
              <div>
                <div className="flex items-start justify-between pb-3 border-b border-brand-border">
                  <div>
                    <span className="font-mono text-brand-text-muted text-[10px]">{selectedTicket.ticketNumber}</span>
                    <h3 className="text-base font-display font-bold text-brand-navy">{selectedTicket.subject}</h3>
                    <p className="text-xs text-brand-text-muted">
                      Category: <strong>{selectedTicket.category}</strong> · Priority: {selectedTicket.priority}
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-brand-surface text-brand-navy border border-brand-border">
                    {selectedTicket.status}
                  </span>
                </div>

                {/* Messages conversation */}
                <div className="py-4 space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                  {selectedTicket.messages?.map((msg: any) => {
                    const isAdmin = msg.senderRole === 'ADMIN';

                    return (
                      <div
                        key={msg.id}
                        className={`p-3.5 rounded-2xl text-xs space-y-1 max-w-[85%] ${
                          isAdmin
                            ? 'bg-brand-navy text-white ml-auto'
                            : 'bg-brand-surface text-brand-navy border border-brand-border mr-auto'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] opacity-75">
                          <span>{msg.senderName} ({msg.senderRole})</span>
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p>{msg.message}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Message Reply Input */}
              <form onSubmit={handleSendMessage} className="pt-3 border-t border-brand-border flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a response to the support team..."
                  required
                  className="flex-1 p-2.5 text-xs rounded-xl border border-brand-border bg-brand-surface text-brand-navy"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !newMessage.trim()}
                  className="px-4 py-2 bg-brand-emerald hover:bg-brand-emerald-dark text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Reply</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-xs text-brand-text-muted space-y-2 py-16">
              <MessageSquare className="w-8 h-8 text-slate-300" />
              <p>Select a ticket from the left panel to inspect the conversation and resolution notes.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-floating border border-brand-border">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-display font-bold text-brand-navy">Create New Support Ticket</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-brand-text-muted hover:text-brand-navy">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div>
                <label className="block text-brand-text-muted mb-1 font-semibold">Issue Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-white"
                >
                  <option value="BOOKING">Booking Modification / Inquiries</option>
                  <option value="PAYMENT">Payment Verification &amp; Charges</option>
                  <option value="CANCELLATION">Cancellation &amp; Deposit Returns</option>
                  <option value="VEHICLE_CONDITION">Vehicle Cleanliness / Mechanical Concern</option>
                  <option value="OWNER_BEHAVIOUR">Host Handover Behavior</option>
                  <option value="DRIVER_BEHAVIOUR">Chauffeur Service Feedback</option>
                  <option value="REFUND">Refund Re-evaluation</option>
                  <option value="TECHNICAL">Website or Technical Bug</option>
                  <option value="OTHER">Other Matters</option>
                </select>
              </div>

              <div>
                <label className="block text-brand-text-muted mb-1 font-semibold">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Summary of inquiry"
                  required
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-brand-text-muted mb-1 font-semibold">Detailed Particulars</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide context, booking ID, or specific question..."
                  rows={3}
                  required
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-white"
                />
              </div>

              <div>
                <label className="block text-brand-text-muted mb-1 font-semibold">Urgency</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-white"
                >
                  <option value="LOW">Low (Standard response within 24h)</option>
                  <option value="MEDIUM">Medium (Expedited within 4h)</option>
                  <option value="HIGH">High (Urgent trip in progress)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-brand-border rounded-xl text-brand-navy font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold rounded-xl shadow-sm"
                >
                  {isSubmitting ? 'Submitting...' : 'Open Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
