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
  MapPin,
  ChevronDown,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { currentUser, primaryRole } = useAuth();
  const { bookings } = useMarketplace();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Delhi NCR');
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);

  const CITIES = ['Delhi NCR', 'Bengaluru', 'Mumbai', 'Goa', 'Hyderabad', 'Pune'];

  const customerBookingsCount = currentUser
    ? bookings.filter((b) => b.customerId === currentUser.id && b.status !== 'cancelled').length
    : 0;

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-brand-border/80 glass-nav transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & City Selector */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-brand-navy flex items-center justify-center text-white shadow-md group-hover:bg-brand-emerald transition-all duration-300">
                <Car className="w-5 h-5 text-brand-emerald group-hover:text-white transition-colors" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-display font-extrabold tracking-tight text-brand-navy">
                  Vahan<span className="text-brand-emerald">Loop</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider text-brand-text-muted font-bold -mt-1">
                  Mobility Marketplace
                </span>
              </div>
            </Link>

            {/* Location selector dropdown */}
            <div className="relative hidden lg:block">
              <button
                type="button"
                onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-navy bg-brand-surface hover:bg-slate-200/60 rounded-full border border-brand-border transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-brand-emerald" />
                <span>{selectedCity}</span>
                <ChevronDown className="w-3 h-3 text-brand-text-muted" />
              </button>

              {cityDropdownOpen && (
                <div className="absolute left-0 mt-2 w-40 bg-white rounded-xl shadow-floating border border-brand-border py-1 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-brand-text-muted">
                    Popular Cities
                  </div>
                  {CITIES.map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedCity(city);
                        setCityDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-brand-surface flex items-center justify-between ${
                        selectedCity === city ? 'text-brand-emerald font-bold bg-brand-emerald-subtle' : 'text-brand-text'
                      }`}
                    >
                      {city}
                      {selectedCity === city && <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              href="/"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive('/')
                  ? 'text-brand-navy bg-brand-surface border border-brand-border/60 shadow-sm'
                  : 'text-brand-text-muted hover:text-brand-navy hover:bg-brand-surface'
              }`}
            >
              Home
            </Link>

            <Link
              href="/explore"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive('/explore')
                  ? 'text-brand-emerald bg-brand-emerald-subtle border border-brand-emerald/20 shadow-sm'
                  : 'text-brand-text-muted hover:text-brand-navy hover:bg-brand-surface'
              }`}
            >
              <Compass className="w-4 h-4" />
              Explore Fleet
            </Link>

            {currentUser && (
              <Link
                href="/bookings"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive('/bookings')
                    ? 'text-brand-emerald bg-brand-emerald-subtle border border-brand-emerald/20 shadow-sm'
                    : 'text-brand-text-muted hover:text-brand-navy hover:bg-brand-surface'
                }`}
              >
                <CalendarCheck className="w-4 h-4" />
                My Bookings
                {customerBookingsCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs font-bold bg-brand-emerald text-white rounded-full">
                    {customerBookingsCount}
                  </span>
                )}
              </Link>
            )}

            {primaryRole === 'owner' ? (
              <div className="flex items-center gap-2 pl-2">
                <Link
                  href="/owner"
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    pathname.startsWith('/owner') && pathname !== '/owner/add-vehicle'
                      ? 'text-brand-navy bg-brand-surface border border-brand-border font-bold'
                      : 'text-brand-text-muted hover:text-brand-navy hover:bg-brand-surface'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-brand-emerald" />
                  Owner Portal
                </Link>
                <Link
                  href="/owner/add-vehicle"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-brand-emerald hover:bg-brand-emerald-dark text-white shadow-sm transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  List Vehicle
                </Link>
              </div>
            ) : primaryRole === 'admin' ? (
              <div className="flex items-center pl-2">
                <Link
                  href="/admin"
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    pathname.startsWith('/admin')
                      ? 'text-brand-navy bg-brand-surface border border-brand-border font-bold'
                      : 'text-brand-text-muted hover:text-brand-navy hover:bg-brand-surface'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-brand-navy" />
                  Admin Console
                </Link>
              </div>
            ) : (
              <Link
                href="/owner"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-brand-emerald hover:bg-brand-emerald-subtle transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-emerald" />
                Host & Earn
              </Link>
            )}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            <RoleSwitcher />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl text-brand-navy bg-brand-surface hover:bg-slate-200/60 border border-brand-border transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-brand-border bg-white px-5 pt-3 pb-6 space-y-2 shadow-floating animate-in slide-in-from-top-2">
          <div className="py-2 mb-2 border-b border-brand-border flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-text-muted">Selected City:</span>
            <div className="flex gap-1.5 flex-wrap">
              {CITIES.slice(0, 3).map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCity(c)}
                  className={`px-2 py-0.5 text-xs rounded-full border ${
                    selectedCity === c
                      ? 'bg-brand-emerald text-white border-brand-emerald font-bold'
                      : 'bg-brand-surface text-brand-text border-brand-border'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3.5 py-2.5 rounded-xl text-sm font-semibold text-brand-text hover:bg-brand-surface"
          >
            Home
          </Link>
          <Link
            href="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3.5 py-2.5 rounded-xl text-sm font-semibold text-brand-text hover:bg-brand-surface"
          >
            Explore Fleet
          </Link>
          {currentUser && (
            <Link
              href="/bookings"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-brand-text hover:bg-brand-surface"
            >
              <span>My Bookings</span>
              {customerBookingsCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-brand-emerald text-white rounded-full">
                  {customerBookingsCount}
                </span>
              )}
            </Link>
          )}
          {primaryRole === 'owner' ? (
            <div className="space-y-1 pt-2 border-t border-brand-border">
              <Link
                href="/owner"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3.5 py-2.5 rounded-xl text-sm font-bold text-brand-navy hover:bg-brand-surface"
              >
                Owner Portal
              </Link>
              <Link
                href="/owner/add-vehicle"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3.5 py-2.5 rounded-xl text-sm font-bold text-brand-emerald hover:bg-brand-emerald-subtle"
              >
                + Register New Vehicle
              </Link>
            </div>
          ) : primaryRole === 'admin' ? (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-sm font-bold text-brand-navy hover:bg-brand-surface"
            >
              Administrator Command Center
            </Link>
          ) : (
            <Link
              href="/owner"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-sm font-bold text-brand-emerald hover:bg-brand-emerald-subtle"
            >
              Become a Host & Earn
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
