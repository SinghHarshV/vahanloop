'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useMarketplace } from '@/context/MarketplaceContext';
import { RoleSwitcher } from './RoleSwitcher';
import {
  Car,
  Compass,
  CalendarCheck,
  ShieldCheck,
  LayoutDashboard,
  PlusCircle,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { currentUser, primaryRole } = useAuth();
  const { bookings } = useMarketplace();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const customerBookingsCount = currentUser
    ? bookings.filter((b) => b.customerId === currentUser.id && b.status !== 'cancelled').length
    : 0;

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-md group-hover:bg-emerald-600 transition-colors">
                <Car className="w-5 h-5 text-emerald-400 group-hover:text-white transition-colors" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  Vahan<span className="text-emerald-600">Loop</span>
                </span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold -mt-1">
                  Mobility Marketplace
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                href="/"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/')
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Home
              </Link>

              <Link
                href="/explore"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/explore')
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Compass className="w-4 h-4" />
                Explore Vehicles
              </Link>

              {currentUser && (
                <Link
                  href="/bookings"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/bookings')
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <CalendarCheck className="w-4 h-4" />
                  My Bookings
                  {customerBookingsCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-[11px] font-bold bg-emerald-600 text-white rounded-full">
                      {customerBookingsCount}
                    </span>
                  )}
                </Link>
              )}

              {primaryRole === 'owner' ? (
                <>
                  <Link
                    href="/owner"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      pathname.startsWith('/owner') && pathname !== '/owner/add-vehicle'
                        ? 'text-amber-800 bg-amber-50'
                        : 'text-slate-700 hover:text-amber-800 hover:bg-amber-50/60'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 text-amber-600" />
                    Owner Dashboard
                  </Link>
                  <Link
                    href="/owner/add-vehicle"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm ml-2"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Add Vehicle
                  </Link>
                </>
              ) : primaryRole === 'admin' ? (
                <Link
                  href="/admin"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    pathname.startsWith('/admin')
                      ? 'text-purple-800 bg-purple-50'
                      : 'text-slate-700 hover:text-purple-800 hover:bg-purple-50/60'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  Admin Console
                </Link>
              ) : (
                <Link
                  href="/owner"
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Become a Partner
                </Link>
              )}
            </nav>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            <RoleSwitcher />

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2 shadow-lg animate-in slide-in-from-top-2">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
            Home
          </Link>
          <Link href="/explore" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
            Explore Vehicles
          </Link>
          {currentUser && (
            <Link href="/bookings" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
              <span>My Bookings</span>
              {customerBookingsCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-emerald-600 text-white rounded-full">
                  {customerBookingsCount}
                </span>
              )}
            </Link>
          )}
          {primaryRole === 'owner' && (
            <Link href="/owner" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
              Owner Dashboard
            </Link>
          )}
          {primaryRole === 'admin' && (
            <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
              Administrator Console
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
