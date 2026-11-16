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
      href: '/admin/vehicles',
      label: 'Vehicle Approvals',
      icon: <CheckSquare className="w-4 h-4" />,
      badge: pendingVehiclesCount > 0 ? pendingVehiclesCount : undefined,
      badgeColor: 'bg-purple-600 text-white',
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
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-1 sm:gap-2">
            {links.map((link) => {
              const isActive = link.exact
                ? pathname === link.href
                : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-purple-100 text-purple-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                  {link.badge !== undefined && (
                    <span
                      className={`ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                        link.badgeColor || 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Quick Demo Reset in Admin Bar */}
          <div className="shrink-0 ml-4">
            {showConfirmReset ? (
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-1 rounded-xl text-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span className="text-rose-800 font-semibold text-[11px]">Factory Reset Demo?</span>
                <button
                  onClick={() => {
                    resetAllDemoData();
                    setShowConfirmReset(false);
                  }}
                  className="px-2 py-0.5 bg-rose-600 text-white rounded font-bold hover:bg-rose-700 text-[10px]"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded font-semibold hover:bg-slate-300 text-[10px]"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmReset(true)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors font-medium border border-transparent hover:border-rose-200"
                title="Reset all vehicles, bookings, and demo users to initial state"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset Demo</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
