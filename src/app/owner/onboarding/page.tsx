'use client';

import React, { useState, useEffect } from 'react';
import { OwnerNav } from '@/components/owner/OwnerNav';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  Building2,
  User,
  CreditCard,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Lock,
  Sparkles,
} from 'lucide-react';

export default function OwnerOnboardingPage() {
  const { currentUser } = useAuth();
  const [step, setStep] = useState(1);
  const [ownerType, setOwnerType] = useState<'INDIVIDUAL' | 'BUSINESS'>('INDIVIDUAL');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('PVT_LTD');
  const [panNumber, setPanNumber] = useState('');
  const [gstin, setGstin] = useState('');

  // Step 2: Identity
  const [idMethod, setIdMethod] = useState('MANUAL_VOTER_ID');
  const [idRef, setIdRef] = useState('');

  // Step 3: Payout
  const [bankHolder, setBankHolder] = useState('');
  const [bankRef, setBankRef] = useState('');

  // Step 4: Terms
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Application Record
  const [appStatus, setAppStatus] = useState<string>('NOT_STARTED');
  const [appId, setAppId] = useState<string | null>(null);

  useEffect(() => {
    async function loadApp() {
      try {
        const res = await fetch('/api/owner/onboarding');
        if (res.ok) {
          const data = await res.json();
          if (data.application) {
            const app = data.application;
            setAppId(app.id);
            setOwnerType(app.ownerType || 'INDIVIDUAL');
            setFullName(app.fullName || '');
            setEmail(app.email || '');
            setMobile(app.mobile || '');
            setAddress(app.address || '');
            setIdMethod(app.idVerificationMethod || 'MANUAL_VOTER_ID');
            setIdRef(app.idVerificationRef || '');
            setBankHolder(app.bankAccountHolder || '');
            setBankRef(app.bankVerificationRef || '');
            setTermsAccepted(Boolean(app.termsAccepted));
            setAppStatus(app.status || 'IN_PROGRESS');
            setStep(app.currentStep || 1);
          } else if (currentUser) {
            setFullName(currentUser.fullName);
            setEmail(currentUser.email);
            setMobile(currentUser.phone);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadApp();
  }, [currentUser]);

  const saveCurrentStep = async (nextStep?: number, finalSubmit = false) => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/owner/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerType,
          currentStep: nextStep || step,
          fullName,
          email,
          mobile,
          address,
          businessName: ownerType === 'BUSINESS' ? businessName : null,
          businessType: ownerType === 'BUSINESS' ? businessType : null,
          panNumber: ownerType === 'BUSINESS' ? panNumber : null,
          gstin: ownerType === 'BUSINESS' ? gstin : null,
          idVerificationMethod: idMethod,
          idVerificationRef: idRef || `SYN-ID-${Date.now().toString().slice(-6)}`,
          bankAccountHolder: bankHolder || fullName,
          bankVerificationRef: bankRef || `SYN-BANK-${Date.now().toString().slice(-6)}`,
          bankVerificationStatus: 'VERIFIED',
          payoutEligible: termsAccepted,
          termsAccepted,
          termsVersion: 'v1.2',
          isFinalSubmission: finalSubmit,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAppStatus(data.application.status);
        if (nextStep) setStep(nextStep);
        if (finalSubmit) {
          setMessage({
            type: 'success',
            text: 'Onboarding application submitted successfully for administrator compliance verification.',
          });
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save progress.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network communication failure.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-16">
        <OwnerNav />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center text-brand-text-muted">
          Loading onboarding profile...
        </div>
      </div>
    );
  }

  const stepsList = [
    { num: 1, title: 'Profile' },
    { num: 2, title: 'Identity' },
    { num: 3, title: 'Payout' },
    { num: 4, title: 'Terms' },
    { num: 5, title: 'Review' },
  ];

  return (
    <div className="space-y-6 pb-16">
      <OwnerNav />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Banner */}
        <div className="bg-brand-navy text-white rounded-3xl p-6 sm:p-8 shadow-floating flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-brand-emerald-accent border border-white/15 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-emerald" />
              <span>Host Verification &amp; Payout Setup</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold">
              Partner Onboarding Workflow
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Complete your partner profile and verified payout setup to start publishing vehicles on VahanLoop.
            </p>
          </div>
          <div className="bg-white/10 px-4 py-2.5 rounded-2xl border border-white/15 text-xs text-right">
            <span className="text-slate-300 block">Current Status:</span>
            <span
              className={`font-black uppercase tracking-wider text-xs ${
                appStatus === 'VERIFIED'
                  ? 'text-brand-emerald'
                  : appStatus === 'SUBMITTED'
                  ? 'text-amber-400'
                  : 'text-white'
              }`}
            >
              {appStatus.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="bg-white p-4 rounded-3xl border border-brand-border shadow-card flex items-center justify-between overflow-x-auto">
          {stepsList.map((s, idx) => (
            <React.Fragment key={s.num}>
              <button
                onClick={() => setStep(s.num)}
                className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors shrink-0 ${
                  step === s.num
                    ? 'bg-brand-navy text-white shadow-sm'
                    : step > s.num
                    ? 'text-brand-emerald hover:bg-brand-surface'
                    : 'text-brand-text-muted hover:text-brand-navy'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    step > s.num
                      ? 'bg-brand-emerald text-white'
                      : step === s.num
                      ? 'bg-white text-brand-navy'
                      : 'bg-brand-surface text-brand-text-muted'
                  }`}
                >
                  {step > s.num ? '✓' : s.num}
                </span>
                <span>{s.title}</span>
              </button>
              {idx < stepsList.length - 1 && (
                <div className="h-0.5 w-6 bg-brand-border shrink-0 hidden sm:block" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Status Message */}
        {message && (
          <div
            className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
              message.type === 'success'
                ? 'bg-brand-emerald-subtle border-brand-emerald/30 text-brand-emerald'
                : 'bg-red-50 border-red-200 text-brand-danger'
            }`}
          >
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="font-bold">
              ×
            </button>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white rounded-3xl border border-brand-border shadow-card p-6 sm:p-8 space-y-6">
          {/* STEP 1: Personal / Business Details */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-display font-bold text-brand-navy">
                  Step 1: Partner Classification &amp; Contact Details
                </h3>
                <p className="text-xs text-brand-text-muted mt-0.5">
                  Choose your account category and provide official correspondence details.
                </p>
              </div>

              {/* Owner Type Selector */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setOwnerType('INDIVIDUAL')}
                  className={`p-4 rounded-2xl border text-left space-y-1 transition-all ${
                    ownerType === 'INDIVIDUAL'
                      ? 'border-brand-emerald bg-brand-emerald-subtle ring-2 ring-brand-emerald'
                      : 'border-brand-border hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 text-brand-navy font-bold text-sm">
                    <User className="w-4 h-4 text-brand-emerald" />
                    <span>Individual Host</span>
                  </div>
                  <p className="text-[11px] text-brand-text-muted">
                    Listing your personal vehicles or small family fleet.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setOwnerType('BUSINESS')}
                  className={`p-4 rounded-2xl border text-left space-y-1 transition-all ${
                    ownerType === 'BUSINESS'
                      ? 'border-brand-emerald bg-brand-emerald-subtle ring-2 ring-brand-emerald'
                      : 'border-brand-border hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 text-brand-navy font-bold text-sm">
                    <Building2 className="w-4 h-4 text-brand-emerald" />
                    <span>Commercial Fleet Operator</span>
                  </div>
                  <p className="text-[11px] text-brand-text-muted">
                    LLP, Pvt Ltd, or rental fleet company managing multiple depots.
                  </p>
                </button>
              </div>

              {ownerType === 'BUSINESS' && (
                <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border space-y-3 text-xs">
                  <h4 className="font-bold text-brand-navy text-xs uppercase tracking-wider">
                    Commercial Business Profile
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-brand-text-muted mb-1 font-semibold">Registered Business Name</label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Apex Mobility Fleet Services LLP"
                        className="w-full p-2.5 rounded-xl border border-brand-border bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-brand-text-muted mb-1 font-semibold">Legal Structure</label>
                      <select
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-brand-border bg-white"
                      >
                        <option value="PVT_LTD">Private Limited (Pvt Ltd)</option>
                        <option value="LLP">Limited Liability Partnership (LLP)</option>
                        <option value="PARTNERSHIP">Partnership Firm</option>
                        <option value="PROPRIETORSHIP">Sole Proprietorship</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-brand-text-muted mb-1 font-semibold">Company PAN</label>
                      <input
                        type="text"
                        value={panNumber}
                        onChange={(e) => setPanNumber(e.target.value)}
                        placeholder="e.g. AABCA1234F"
                        className="w-full p-2.5 rounded-xl border border-brand-border bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-brand-text-muted mb-1 font-semibold">GSTIN (Optional)</label>
                      <input
                        type="text"
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value)}
                        placeholder="e.g. 29AABCA1234F1Z5"
                        className="w-full p-2.5 rounded-xl border border-brand-border bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-brand-text-muted mb-1 font-semibold">Contact Person Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-brand-text-muted mb-1 font-semibold">Official Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-white"
                  />
                </div>
                <div>
                  <label className="block text-brand-text-muted mb-1 font-semibold">Mobile Phone (SMS Notifications)</label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-brand-text-muted mb-1 font-semibold">Registered Office / Residential Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Full street address and city"
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  disabled={saving || !fullName || !email}
                  onClick={() => saveCurrentStep(2)}
                  className="px-6 py-2.5 bg-brand-navy hover:bg-brand-navy-light text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm"
                >
                  <span>Continue to Identity</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Identity Verification */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-display font-bold text-brand-navy">
                  Step 2: Identity Verification Reference
                </h3>
                <p className="text-xs text-brand-text-muted mt-0.5">
                  We use privacy-preserving verification methods during prototype testing without collecting sensitive document photos.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border flex items-start gap-3">
                <Lock className="w-5 h-5 text-brand-emerald shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <h4 className="font-bold text-brand-navy">Regulated Pilot Privacy Notice</h4>
                  <p className="text-brand-text-muted">
                    No Aadhaar numbers or government credentials are stored. Synthetic verification tokens simulate certified KYC approval.
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-brand-text-muted mb-1 font-semibold">Verification Method</label>
                  <select
                    value={idMethod}
                    onChange={(e) => setIdMethod(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-white"
                  >
                    <option value="MANUAL_VOTER_ID">Election Commission Voter ID</option>
                    <option value="MANUAL_PASSPORT">Indian Passport Verification</option>
                    <option value="MANUAL_PAN">Income Tax Department PAN</option>
                    <option value="AUTHORIZED_PARTNER_API">Authorized Verification API (Test Mode)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-brand-text-muted mb-1 font-semibold">Verification Reference / Token</label>
                  <input
                    type="text"
                    value={idRef}
                    onChange={(e) => setIdRef(e.target.value)}
                    placeholder="e.g. SYN-DL-KA0320198811"
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 border border-brand-border text-brand-navy font-bold rounded-xl text-xs flex items-center gap-1.5 hover:bg-brand-surface"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => saveCurrentStep(3)}
                  className="px-6 py-2.5 bg-brand-navy hover:bg-brand-navy-light text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm"
                >
                  <span>Continue to Payout Setup</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Bank Payout Profile */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-display font-bold text-brand-navy">
                  Step 3: Bank Payout Profile
                </h3>
                <p className="text-xs text-brand-text-muted mt-0.5">
                  Rental earnings and host payouts will be credited to this verified account.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-brand-text-muted mb-1 font-semibold">Account Beneficiary Name</label>
                  <input
                    type="text"
                    value={bankHolder}
                    onChange={(e) => setBankHolder(e.target.value)}
                    placeholder="Must match official KYC record"
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-brand-text-muted mb-1 font-semibold">Bank Payout Verification Ref (IFSC Token)</label>
                  <input
                    type="text"
                    value={bankRef}
                    onChange={(e) => setBankRef(e.target.value)}
                    placeholder="e.g. SYN-HDFC-991204"
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-white font-mono"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-brand-surface border border-brand-border text-xs flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0" />
                <span className="text-brand-text-muted">
                  Test Banking Environment: Payout eligibility is automatically simulated for authenticated accounts.
                </span>
              </div>

              <div className="flex justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 border border-brand-border text-brand-navy font-bold rounded-xl text-xs flex items-center gap-1.5 hover:bg-brand-surface"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => saveCurrentStep(4)}
                  className="px-6 py-2.5 bg-brand-navy hover:bg-brand-navy-light text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm"
                >
                  <span>Terms &amp; Agreements</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Terms & Agreement */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-display font-bold text-brand-navy">
                  Step 4: Platform Terms &amp; Host Agreement
                </h3>
                <p className="text-xs text-brand-text-muted mt-0.5">
                  Review mandatory operating covenants, commission agreements, and insurance conditions.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border text-xs space-y-3 max-h-56 overflow-y-auto">
                <h4 className="font-bold text-brand-navy">VahanLoop Host Operating Agreement (v1.2)</h4>
                <p className="text-brand-text-muted">
                  1. The host warrants that every registered vehicle possesses an active, unexpired Registration Certificate, Comprehensive Commercial Insurance, and Pollution Under Control (PUC) certificate.
                </p>
                <p className="text-brand-text-muted">
                  2. For commercial fleet operations in designated pilot jurisdictions, hosts must adhere to state scheme provisions (Rent a Cab Scheme 1989 / Rent a Motorcycle Scheme 1997).
                </p>
                <p className="text-brand-text-muted">
                  3. In the event of a customer breakdown or safety incident, hosts agree to cooperate with the platform emergency response center and roadside assistance protocols.
                </p>
              </div>

              <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-brand-border cursor-pointer hover:bg-brand-surface transition-colors">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="w-4 h-4 rounded mt-0.5 text-brand-emerald focus:ring-brand-emerald"
                />
                <div className="text-xs">
                  <span className="font-bold text-brand-navy">
                    I agree to the VahanLoop Host Agreement (v1.2) and Platform Operating Terms.
                  </span>
                  <p className="text-brand-text-muted mt-0.5">
                    Your timestamped IP and account signature will be recorded in platform audit logs.
                  </p>
                </div>
              </label>

              <div className="flex justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 border border-brand-border text-brand-navy font-bold rounded-xl text-xs flex items-center gap-1.5 hover:bg-brand-surface"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  disabled={saving || !termsAccepted}
                  onClick={() => saveCurrentStep(5)}
                  className="px-6 py-2.5 bg-brand-navy hover:bg-brand-navy-light text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
                >
                  <span>Review Application</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Final Review & Submission */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-display font-bold text-brand-navy">
                  Step 5: Review &amp; Submit Application
                </h3>
                <p className="text-xs text-brand-text-muted mt-0.5">
                  Confirm all details before submitting for administrative compliance verification.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border space-y-2">
                  <h4 className="font-bold text-brand-navy uppercase tracking-wider text-[10px]">Host Profile</h4>
                  <p><span className="text-brand-text-muted">Type:</span> <strong>{ownerType}</strong></p>
                  <p><span className="text-brand-text-muted">Name:</span> {fullName}</p>
                  <p><span className="text-brand-text-muted">Email:</span> {email}</p>
                  <p><span className="text-brand-text-muted">Mobile:</span> {mobile}</p>
                  {ownerType === 'BUSINESS' && (
                    <p><span className="text-brand-text-muted">Business:</span> {businessName || 'Apex Fleet'}</p>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border space-y-2">
                  <h4 className="font-bold text-brand-navy uppercase tracking-wider text-[10px]">Verification &amp; Payout</h4>
                  <p><span className="text-brand-text-muted">Identity Method:</span> {idMethod}</p>
                  <p><span className="text-brand-text-muted">Bank Beneficiary:</span> {bankHolder || fullName}</p>
                  <p><span className="text-brand-text-muted">Agreement:</span> Terms v1.2 Accepted</p>
                  <p>
                    <span className="text-brand-text-muted">Payout Status:</span>{' '}
                    <span className="text-brand-emerald font-bold">ELIGIBLE (Simulated)</span>
                  </p>
                </div>
              </div>

              <div className="flex justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-5 py-2.5 border border-brand-border text-brand-navy font-bold rounded-xl text-xs flex items-center gap-1.5 hover:bg-brand-surface"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  disabled={saving || !termsAccepted}
                  onClick={() => saveCurrentStep(5, true)}
                  className="px-7 py-3 bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-floating disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{saving ? 'Submitting...' : 'Submit Verification Application'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
