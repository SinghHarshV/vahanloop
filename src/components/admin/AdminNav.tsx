'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  CheckSquare,
  CalendarDays,
  CreditCard,
  FileCheck2,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { useMarketplace } from '@/context/MarketplaceContext';

export const AdminNav: React.FC = () => {
  const pathname = usePathname();
  const { vehicles, bookings, resetAllDemoData } = useMarketplace();
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const pendingVehiclesCount = vehicles.filter(
    (v) => (v.approvalStatus as string).toLowerCase() === 'pending'
  ).length;

  const links = [
    {
      href: '/admin',
      label: 'Overview',
      icon: <ShieldCheck className="w-4 h-4" />,
      exact: true,
    },
    {
      href: '/admin/operations',
      label: 'Operations & Compliance Hub',
      icon: <ShieldCheck className="w-4 h-4 text-brand-emerald" />,
    },
    {
      href: '/admin/vehicles',
      label: 'Vehicle Approvals',
      icon: <CheckSquare className="w-4 h-4" />,
      badge: pendingVehiclesCount > 0 ? pendingVehiclesCount : undefined,
      badgeColor: 'bg-brand-emerald text-white',
    },
    {
      href: '/admin/documents',
      label: 'Document Verification',
      icon: <FileCheck2 className="w-4 h-4" />,
    },
    {
      href: '/admin/bookings',
      label: 'Reservations',
      icon: <CalendarDays className="w-4 h-4" />,
      badge: bookings.length > 0 ? bookings.length : undefined,
    },
    {
      href: '/admin/payments',
      label: 'Payments & Refunds',
      icon: <CreditCard className="w-4 h-4" />,
    },
  ];

  return (
    <>
      <div className="bg-white border-b border-brand-border sticky top-20 z-30 shadow-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2.5 overflow-x-auto custom-scrollbar text-xs font-bold gap-3">
            <div className="flex items-center gap-1.5 shrink-0">
              {links.map((link) => {
                const isActive = link.exact
                  ? pathname === link.href
                  : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-brand-navy text-white shadow-sm'
                        : 'text-brand-text-muted hover:text-brand-navy hover:bg-brand-surface'
                    }`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                    {link.badge !== undefined && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          link.badgeColor || 'bg-brand-surface text-brand-navy border border-brand-border'
                        }`}
                      >
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            <button
              onClick={() => setShowConfirmReset(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-brand-text-muted hover:text-brand-danger hover:bg-brand-danger/10 border border-brand-border transition-colors shrink-0"
              title="Reset all demo data back to clean factory state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo State</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-floating border border-brand-border">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-display font-bold text-brand-navy text-base">Reset Demo State?</h3>
              <p className="text-xs text-brand-text-muted">
                This will re-initialize the baseline simulated seed state.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-brand-surface hover:bg-slate-200/60 text-brand-text"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetAllDemoData();
                  setShowConfirmReset(false);
                }}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-brand-danger hover:bg-red-700 text-white shadow-sm"
              >
                Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
