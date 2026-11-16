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
  FileCheck2,
  ClipboardCheck,
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
      href: '/owner/onboarding',
      label: 'Onboarding & KYC',
      icon: <FileCheck2 className="w-4 h-4" />,
    },
    {
      href: '/owner/fleet',
      label: 'Fleet Operations',
      icon: <Car className="w-4 h-4" />,
      badge: ownerVehiclesCount > 0 ? ownerVehiclesCount : undefined,
    },
    {
      href: '/owner/drivers',
      label: 'Driver Roster',
      icon: <ClipboardCheck className="w-4 h-4" />,
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
      alert: pendingRequests > 0,
    },
    {
      href: '/owner/documents',
      label: 'Documents Safe',
      icon: <FileCheck2 className="w-4 h-4" />,
    },
    {
      href: '/owner/inspections',
      label: 'Inspections',
      icon: <ClipboardCheck className="w-4 h-4" />,
    },
    {
      href: '/owner/earnings',
      label: 'Earnings Ledger',
      icon: <IndianRupee className="w-4 h-4" />,
    },
  ];

  return (
    <div className="bg-white border-b border-brand-border sticky top-20 z-30 shadow-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 custom-scrollbar text-xs font-bold">
          {links.map((link) => {
            const isActive = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
                  link.highlight
                    ? 'bg-brand-emerald text-white hover:bg-brand-emerald-dark shadow-sm'
                    : isActive
                    ? 'bg-brand-surface text-brand-navy border border-brand-border shadow-sm'
                    : 'text-brand-text-muted hover:text-brand-navy hover:bg-brand-surface'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
                {link.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      link.alert
                        ? 'bg-amber-500 text-white animate-pulse'
                        : 'bg-brand-surface text-brand-navy border border-brand-border'
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
