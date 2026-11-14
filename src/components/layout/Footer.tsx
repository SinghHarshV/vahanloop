import React from 'react';
import Link from 'next/link';
import { Car, ShieldAlert, Heart, MapPin, Mail, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto bg-slate-900 text-slate-300 border-t border-slate-800">
      {/* Top Banner / Disclaimer */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-start sm:items-center gap-2.5 text-xs text-amber-300">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5 sm:mt-0" />
          <p>
            <strong className="font-semibold text-amber-200">VahanLoop Prototype:</strong> This
            application is a demonstration only. Listings, users, approvals, bookings and payments
            are simulated. No real vehicle rentals or financial transactions are processed.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Car className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Vahan<span className="text-emerald-400">Loop</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your vehicle. Your earnings. Your journey. India’s trusted peer-to-peer mobility
              marketplace connecting verified vehicle hosts with smart travelers.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Bengaluru · Delhi NCR · Mumbai · Pune</span>
            </div>
          </div>

          {/* Customer links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              Explore Mobility
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/explore?category=car" className="hover:text-emerald-400 transition-colors">
                  Cars for Rent (Self-Drive)
                </Link>
              </li>
              <li>
                <Link href="/explore?category=bike" className="hover:text-emerald-400 transition-colors">
                  Cruisers & Commuter Bikes
                </Link>
              </li>
              <li>
                <Link href="/explore?category=scooter" className="hover:text-emerald-400 transition-colors">
                  Automatic Scooters
                </Link>
              </li>
              <li>
                <Link href="/explore?rentalType=with-driver" className="hover:text-emerald-400 transition-colors">
                  Chauffeur / With Driver Rentals
                </Link>
              </li>
              <li>
                <Link href="/bookings" className="hover:text-emerald-400 transition-colors">
                  Track Existing Bookings
                </Link>
              </li>
            </ul>
          </div>

          {/* Vehicle Hosts */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              For Vehicle Partners
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/owner/add-vehicle" className="hover:text-emerald-400 transition-colors">
                  List Your Vehicle
                </Link>
              </li>
              <li>
                <Link href="/owner" className="hover:text-emerald-400 transition-colors">
                  Owner Dashboard
                </Link>
              </li>
              <li>
                <Link href="/owner/requests" className="hover:text-emerald-400 transition-colors">
                  Rental Requests
                </Link>
              </li>
              <li>
                <Link href="/owner/earnings" className="hover:text-emerald-400 transition-colors">
                  Simulated Earnings
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-emerald-400 transition-colors">
                  Admin Review Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Prototype details */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              Prototype Version 0.1
            </h4>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 space-y-2 text-xs text-slate-400">
              <p>
                <span className="text-emerald-400 font-medium">Stack:</span> Next.js App Router,
                TypeScript, Tailwind CSS, LocalStorage persistence.
              </p>
              <p>
                <span className="text-emerald-400 font-medium">Architecture:</span> Modular services,
                ready for PostgreSQL / FastAPI backend integration.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} VahanLoop Mobility Technologies. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Can You Hack It?
          </p>
        </div>
      </div>
    </footer>
  );
};
