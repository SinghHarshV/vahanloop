'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useMarketplace } from '@/context/MarketplaceContext';
import { User, ShieldCheck, Key, RotateCcw, ChevronDown, LogOut, LogIn } from 'lucide-react';
import Link from 'next/link';

const DEMO_QUICK_LOGIN = [
  { label: 'Customer', email: 'customer@vahanloop.demo', roleColor: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { label: 'Owner', email: 'owner@vahanloop.demo', roleColor: 'bg-amber-100 text-amber-800 border-amber-200' },
  { label: 'Admin', email: 'admin@vahanloop.demo', roleColor: 'bg-purple-100 text-purple-800 border-purple-200' },
];

export const RoleSwitcher: React.FC = () => {
  const { currentUser, primaryRole, logout, login } = useAuth();
  const { resetAllDemoData } = useMarketplace();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const getRoleBadge = (role: string | null) => {
    switch (role) {
      case 'admin':
        return { bg: 'bg-purple-100 text-purple-800 border-purple-200', icon: <ShieldCheck className="w-3.5 h-3.5" />, label: 'Platform Admin' };
      case 'owner':
        return { bg: 'bg-amber-100 text-amber-800 border-amber-200', icon: <Key className="w-3.5 h-3.5" />, label: 'Vehicle Partner' };
      case 'customer':
      default:
        return { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: <User className="w-3.5 h-3.5" />, label: 'Customer' };
    }
  };

  const handleDemoSwitch = async (email: string) => {
    setIsSwitching(true);
    setIsOpen(false);
    await login(email, 'Demo@123456');
    setIsSwitching(false);
  };

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  // Not logged in
  if (!currentUser) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-slate-200 bg-white shadow-sm hover:bg-slate-50 text-slate-700 transition-all"
      >
        <LogIn className="w-3.5 h-3.5" />
        Sign In
      </Link>
    );
  }

  const badge = getRoleBadge(primaryRole);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSwitching}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border bg-white shadow-sm hover:bg-slate-50 transition-all text-slate-700 disabled:opacity-60"
        title="Account menu"
      >
        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold border ${badge.bg}`}>
          {badge.icon}
          {badge.label}
        </span>
        <span className="hidden sm:inline text-slate-600 truncate max-w-[120px]">
          {currentUser.fullName.split(' ')[0]}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Current user info */}
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-700 uppercase">
                  {currentUser.fullName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{currentUser.fullName}</p>
                  <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                  <span className={`inline-flex items-center gap-1 mt-0.5 text-[10px] px-2 py-0.5 rounded font-semibold border ${badge.bg}`}>
                    {badge.icon}
                    {badge.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Demo Quick Switch */}
            <div className="px-4 py-2 border-b border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Switch Demo Account
              </p>
              <div className="space-y-1">
                {DEMO_QUICK_LOGIN.map((acc) => {
                  const isCurrent = currentUser.email === acc.email;
                  return (
                    <button
                      key={acc.email}
                      onClick={() => handleDemoSwitch(acc.email)}
                      disabled={isCurrent}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors ${
                        isCurrent
                          ? 'bg-slate-100 text-slate-500 cursor-default'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className={`px-2 py-0.5 rounded font-semibold border text-[10px] ${acc.roleColor}`}>
                        {acc.label}
                      </span>
                      <span className="text-slate-400 truncate ml-2">{acc.email.split('@')[0]}</span>
                      {isCurrent && (
                        <span className="ml-auto text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-semibold">
                          Active
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reset demo data */}
            <div className="px-4 py-2 border-b border-slate-100">
              {confirmReset ? (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5 text-center">
                  <p className="text-xs font-medium text-rose-800">Restore all seed vehicles & bookings?</p>
                  <div className="flex gap-2 justify-center mt-2">
                    <button
                      onClick={() => { resetAllDemoData(); setConfirmReset(false); setIsOpen(false); }}
                      className="px-2.5 py-1 text-xs bg-rose-600 text-white rounded font-medium hover:bg-rose-700"
                    >
                      Yes, Reset
                    </button>
                    <button
                      onClick={() => setConfirmReset(false)}
                      className="px-2.5 py-1 text-xs bg-slate-200 text-slate-700 rounded font-medium hover:bg-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmReset(true)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-slate-500 hover:text-rose-600 font-medium rounded hover:bg-rose-50 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Demo Data
                </button>
              )}
            </div>

            {/* Logout */}
            <div className="px-4 py-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-slate-600 hover:text-rose-600 font-medium rounded hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
