'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  CheckSquare,
  CalendarDays,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { useMarketplace } from '@/context/MarketplaceContext';

export const AdminNav: React.FC = () => {
  const pathname = usePathname();
  const { vehicles, bookings, resetAllDemoData } = useMarketplace();
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const pendingVehiclesCount = vehicles.filter((v) => v.approvalStatus === 'pending').length;

  const links = [
    {
      href: '/admin',
      label: 'Admin Overview',
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
      href: '/admin/bookings',
      label: 'Marketplace Bookings',
      icon: <CalendarDays className="w-4 h-4" />,
      badge: bookings.length > 0 ? bookings.length : undefined,
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
                : pathname.startsWith(link.href) &&
                  (link.href !== '/admin' || pathname === '/admin');

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-purple-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                  {link.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        link.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700')
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Admin Reset Button */}
          <div>
            {showConfirmReset ? (
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl">
                <span className="text-xs font-semibold text-rose-800">Reset all demo data?</span>
                <button
                  onClick={() => {
                    resetAllDemoData();
                    setShowConfirmReset(false);
                  }}
                  className="px-2 py-0.5 text-xs bg-rose-600 text-white rounded font-bold hover:bg-rose-700"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="px-2 py-0.5 text-xs bg-slate-200 text-slate-700 rounded font-medium hover:bg-slate-300"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmReset(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-700 bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition-all"
                title="Restore all vehicles and bookings to factory seed state"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo Data</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
