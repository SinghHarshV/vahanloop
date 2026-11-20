'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, FileText, ArrowLeft, Download, Mail } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-brand-emerald-subtle text-brand-emerald-dark border border-brand-emerald/20 mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>DPDP Act 2023 & IT Rules 2021 Compliant</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-brand-navy tracking-tight">
          Privacy & Data Protection Policy
        </h1>
        <p className="text-sm text-brand-text-muted mt-2">
          Effective Date: November 2026 · VahanLoop Mobility Inc.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-brand-border shadow-card space-y-8 text-sm text-slate-700 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-display font-bold text-brand-navy">1. Overview and Scope</h2>
          <p>
            VahanLoop Mobility Inc. (“VahanLoop”, “we”, “us”, or “our”) is committed to safeguarding the digital personal data of vehicle owners, commercial fleet operators, drivers, and guests using our mobility platform. This policy is aligned with India’s <strong>Digital Personal Data Protection Act, 2023 (DPDPA)</strong> and the <strong>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</strong>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-display font-bold text-brand-navy">2. Personal Data We Collect</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Identity & Profile Information:</strong> Full name, verified mobile number, email address, password hash (one-way bcrypt), and optional profile photographs.</li>
            <li><strong>Vehicle Documentation:</strong> Vehicle Registration Certificate (RC), Commercial Permits (Rent a Cab / Rent a Motorcycle), PUC, and Insurance policies required for regulatory verification.</li>
            <li><strong>Driver Credentials:</strong> Commercial driving license details, badge numbers, and vehicle inspection handover/return photographs.</li>
            <li><strong>Transactional Data:</strong> Reservation hold timestamps, integer paise financial ledger records, and test payment references. We do not store raw card numbers, CVVs, or bank netbanking passwords.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-display font-bold text-brand-navy">3. Purpose of Processing & Document Security</h2>
          <p>
            All uploaded vehicle and identity documents are stored in private S3/R2 encrypted vaults with <strong>AES-256 server-side encryption</strong>. Documents are never accessible through public URLs and are rendered exclusively via cryptographically signed temporary tokens (expiring in 300 seconds) accessible only by verified administrators and the respective vehicle owner.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-display font-bold text-brand-navy">4. Your Data Subject Rights (Portability & Erasure)</h2>
          <p>
            Under Indian DPDP Act regulations, you hold the right to review, export, and request the deletion or anonymization of your personal data at any time.
          </p>
          <div className="p-4 bg-brand-surface rounded-2xl border border-brand-border flex items-center justify-between">
            <div>
              <p className="font-bold text-brand-navy">Export Personal Data</p>
              <p className="text-xs text-brand-text-muted">Download complete machine-readable JSON copy of your bookings, vehicles, and profile.</p>
            </div>
            <a
              href="/api/user/data-export"
              target="_blank"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-navy text-white hover:bg-brand-emerald transition-colors inline-flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download JSON
            </a>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-display font-bold text-brand-navy">5. Grievance Officer & Contact</h2>
          <p>
            In accordance with IT Act guidelines, our designated Data Protection & Grievance Officer can be contacted at:
          </p>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1">
            <p><strong>Grievance Officer:</strong> Data Privacy Desk, VahanLoop Mobility Inc.</p>
            <p><strong>Address:</strong> Indiranagar 100 Feet Road, Bengaluru, Karnataka 560038</p>
            <p><strong>Email:</strong> privacy@vahanloop.com</p>
          </div>
        </section>
      </div>
    </div>
  );
}
