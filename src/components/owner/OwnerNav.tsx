'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Car,
  PlusCircle,
  Inbox,
  IndianRupee,
  ShieldCheck,
} from 'lucide-react';
import { useMarketplace } from '@/context/MarketplaceContext';
import { useAuth } from '@/context/AuthContext';

export const OwnerNav: React.FC = () => {
  const pathname = usePathname();
  const { currentUser } = useAuth();
  const { bookings, vehicles } = useMarketplace();

  const pendingRequests = currentUser
    ? bookings.filter(
        (b) => b.ownerId === currentUser.id && b.status === 'requested'
      ).length
    : 0;

  const ownerVehiclesCount = currentUser
    ? vehicles.filter((v) => v.ownerId === currentUser.id).length
    : 0;

  const links = [
    {
      href: '/owner',
      label: 'Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
      exact: true,
    },
    {
      href: '/owner/vehicles',
      label: 'My Fleet',
      icon: <Car className="w-4 h-4" />,
      badge: ownerVehiclesCount > 0 ? ownerVehiclesCount : undefined,
    },
    {
      href: '/owner/add-vehicle',
      label: 'Add Vehicle',
      icon: <PlusCircle className="w-4 h-4" />,
      highlight: true,
    },
    {
      href: '/owner/requests',
      label: 'Booking Requests',
      icon: <Inbox className="w-4 h-4" />,
      badge: pendingRequests > 0 ? pendingRequests : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      href: '/owner/earnings',
      label: 'Simulated Earnings',
      icon: <IndianRupee className="w-4 h-4" />,
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
                  (link.href !== '/owner' || pathname === '/owner');

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : link.highlight
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
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

          <div className="hidden lg:flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200/60">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Host Mode: Vikramaditya Verma</span>
          </div>
        </div>
      </div>
    </div>
  );
};
