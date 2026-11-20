'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, FileCheck, AlertCircle } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-brand-navy hover:text-brand-emerald bg-white px-4 py-2 rounded-full border border-brand-border shadow-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Marketplace
        </Link>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-brand-navy/10 text-brand-navy border border-brand-navy/20 mb-3">
          <FileCheck className="w-3.5 h-3.5 text-brand-emerald" />
          <span>Platform Terms & Rental Agreement</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-brand-navy tracking-tight">
          Terms of Service
        </h1>
        <p className="text-sm text-brand-text-muted mt-2">
          Effective Date: November 2026 · VahanLoop Mobility Inc.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-brand-border shadow-card space-y-8 text-sm text-slate-700 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-display font-bold text-brand-navy">1. The VahanLoop Marketplace Model</h2>
          <p>
            VahanLoop operates an online peer-to-peer and commercial fleet mobility platform connecting vehicle hosts with registered customers. VahanLoop acts as an electronic intermediary under Section 79 of the Information Technology Act, 2000 and facilitates booking reservations, digital condition verification, and payment escrow facilitation.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-display font-bold text-brand-navy">2. Regulatory & Compliance Framework</h2>
          <p>
            All listed vehicles and operations must strictly comply with the <strong>Motor Vehicles Act, 1988</strong>, the <strong>Rent a Cab Scheme, 1989</strong>, and the <strong>Rent a Motorcycle Scheme, 1997</strong> as promulgated by the Ministry of Road Transport and Highways (MoRTH), Government of India.
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Self-Drive Rentals:</strong> Require a valid digital RC, comprehensive commercial or valid rental insurance, and active PUC.</li>
            <li><strong>Chauffeur Operations:</strong> Drivers assigned to trips must hold commercial transport badges (e.g. LMV-TR) and have cleared background checks.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-display font-bold text-brand-navy">3. Booking, Holds & Cancellation Schedule</h2>
          <p>
            When an owner accepts a rental request, the vehicle is reserved on an exclusive <strong>15-minute guaranteed hold</strong>. The customer must complete test-mode checkout before expiry.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <div className="p-4 bg-brand-surface rounded-2xl border border-brand-border">
              <strong className="text-brand-navy block">Free Cancellation</strong>
              <p className="text-xs text-brand-text-muted mt-1">Full 100% refund for cancellations made more than 24 hours prior to trip start time.</p>
            </div>
            <div className="p-4 bg-brand-surface rounded-2xl border border-brand-border">
              <strong className="text-brand-navy block">Late Cancellation</strong>
              <p className="text-xs text-brand-text-muted mt-1">50% fee applies for cancellations within 24 hours of scheduled vehicle handover.</p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-display font-bold text-brand-navy">4. Inspection Telemetry & Handover</h2>
          <p>
            Both host and customer must complete the digital handover checklist upon vehicle release and return, recording odometer reading, fuel percentage, and photo documentation of pre-existing blemishes. Unreported new damages are automatically referred to the VahanLoop Incident & Dispute Desk.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-display font-bold text-brand-navy">5. Prototype Demonstrator Notice</h2>
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Controlled Pilot & Test Mode Environment</strong>
              <p className="mt-0.5">All financial transactions on this deployment occur in test mode. No real customer currency is deducted or disbursed to hosts during this evaluation phase.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
