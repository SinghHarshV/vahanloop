'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Car, Eye, EyeOff, AlertCircle, ArrowRight, User, Key } from 'lucide-react';

type AccountType = 'customer' | 'owner';
type OwnerType = 'INDIVIDUAL' | 'BUSINESS';

export default function RegisterPage() {
  const { register, currentUser, isLoaded } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [accountType, setAccountType] = useState<AccountType>('customer');
  const [ownerType, setOwnerType] = useState<OwnerType>('INDIVIDUAL');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isLoaded && currentUser) {
      router.replace('/');
    }
  }, [isLoaded, currentUser, router]);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (accountType === 'owner') {
      setStep(2);
    } else {
      handleRegister();
    }
  };

  const handleRegister = async () => {
    setError('');
    setIsSubmitting(true);
    const result = await register({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password,
      role: accountType,
      ownerType: accountType === 'owner' ? ownerType : undefined,
      businessName: accountType === 'owner' && ownerType === 'BUSINESS' ? businessName.trim() : undefined,
    });
    if (result.success) {
      router.push('/');
    } else {
      setError(result.error || 'Registration failed. Please try again.');
    }
    setIsSubmitting(false);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRegister();
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                <Car className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  Vahan<span className="text-emerald-600">Loop</span>
                </span>
                <p className="text-xs text-slate-400 -mt-0.5">Mobility Marketplace</p>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              {step === 1 ? 'Create your account' : 'Owner details'}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {step === 1
                ? 'Join VahanLoop to rent or list vehicles.'
                : 'Tell us a bit about your fleet operation.'}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleNext} className="px-8 py-6 space-y-5">
              {/* Account type selector */}
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">I want to…</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAccountType('customer')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      accountType === 'customer'
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <User className={`w-6 h-6 ${accountType === 'customer' ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span className={`text-sm font-semibold ${accountType === 'customer' ? 'text-emerald-800' : 'text-slate-600'}`}>
                      Rent Vehicles
                    </span>
                    <span className="text-[11px] text-slate-400">Customer account</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('owner')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      accountType === 'owner'
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Key className={`w-6 h-6 ${accountType === 'owner' ? 'text-amber-600' : 'text-slate-400'}`} />
                    <span className={`text-sm font-semibold ${accountType === 'owner' ? 'text-amber-800' : 'text-slate-600'}`}>
                      List Vehicles
                    </span>
                    <span className="text-[11px] text-slate-400">Owner account</span>
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Rahul Sharma"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    required
                    minLength={8}
                    className="w-full px-4 py-2.5 pr-10 rounded-lg border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    {accountType === 'owner' ? 'Next: Owner Details' : 'Create Account'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleStep2Submit} className="px-8 py-6 space-y-5">
              {error && (
                <div className="flex items-start gap-2.5 p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Owner type</p>
                <div className="grid grid-cols-2 gap-3">
                  {(['INDIVIDUAL', 'BUSINESS'] as OwnerType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setOwnerType(type)}
                      className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                        ownerType === type
                          ? 'border-amber-500 bg-amber-50 text-amber-800'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {type === 'INDIVIDUAL' ? 'Individual' : 'Business / Fleet'}
                    </button>
                  ))}
                </div>
              </div>

              {ownerType === 'BUSINESS' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Business name</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Verma Rentals Pvt. Ltd."
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  />
                </div>
              )}

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                <strong>Note:</strong> Your vehicle listings will require admin approval before going live. 
                Document verification is handled during the review process.
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-60 transition-colors text-sm"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <>Create Account <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="px-8 pb-6 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
