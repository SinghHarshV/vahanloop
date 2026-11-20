import React from 'react';
import Link from 'next/link';
import { Car, ShieldAlert, MapPin, Mail, Phone, ShieldCheck, Award, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto bg-brand-navy text-slate-300 border-t border-brand-navy-light">
      {/* Top Banner / Prototype Transparency */}
      <div className="bg-brand-navy-dark/70 border-b border-brand-navy-light/40 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-start sm:items-center gap-2.5 text-xs text-slate-300">
          <ShieldAlert className="w-4 h-4 shrink-0 text-brand-emerald mt-0.5 sm:mt-0" />
          <p>
            <strong className="font-semibold text-white">VahanLoop Compliance Notice:</strong> Prototype
            demonstrator mode. Payments use simulated sandbox triggers. No actual monetary deductions are made.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-emerald flex items-center justify-center text-white shadow-md">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-display font-extrabold tracking-tight text-white">
                Vahan<span className="text-brand-emerald">Loop</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Your vehicle. Your earnings. Your journey. Modern peer-to-peer mobility marketplace connecting
              verified vehicle hosts with reliable travelers across India.
            </p>
            <div className="flex flex-col gap-2 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-brand-emerald" />
                <span>Delhi NCR · Bengaluru · Mumbai · Goa · Hyderabad · Pune · Jabalpur</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-brand-emerald" />
                <span>256-bit encrypted reservation holds & verified digital inspections</span>
              </div>
            </div>
          </div>

          {/* Explore Mobility */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Explore Fleet
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/explore?category=car" className="hover:text-brand-emerald transition-colors">
                  Cars (Self-Drive)
                </Link>
              </li>
              <li>
                <Link href="/explore?category=bike" className="hover:text-brand-emerald transition-colors">
                  Cruisers & Street Bikes
                </Link>
              </li>
              <li>
                <Link href="/explore?category=scooter" className="hover:text-brand-emerald transition-colors">
                  City Scooters & EV
                </Link>
              </li>
              <li>
                <Link href="/explore?rentalType=with-driver" className="hover:text-brand-emerald transition-colors">
                  Chauffeur Rentals
                </Link>
              </li>
              <li>
                <Link href="/bookings" className="hover:text-brand-emerald transition-colors">
                  Manage Trips
                </Link>
              </li>
            </ul>
          </div>

          {/* Vehicle Hosts */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              For Hosts & Fleets
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/owner/add-vehicle" className="hover:text-brand-emerald transition-colors">
                  List Your Vehicle
                </Link>
              </li>
              <li>
                <Link href="/owner" className="hover:text-brand-emerald transition-colors">
                  Host Dashboard
                </Link>
              </li>
              <li>
                <Link href="/owner/requests" className="hover:text-brand-emerald transition-colors">
                  Rental Requests
                </Link>
              </li>
              <li>
                <Link href="/owner/documents" className="hover:text-brand-emerald transition-colors">
                  Document Safe
                </Link>
              </li>
              <li>
                <Link href="/owner/inspections" className="hover:text-brand-emerald transition-colors">
                  Condition Inspections
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Governance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Trust & Safety
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-center gap-1.5 text-xs text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-emerald" />
                <span>RC & Insurance Verified</span>
              </li>
              <li className="flex items-center gap-1.5 text-xs text-slate-400">
                <Award className="w-3.5 h-3.5 text-brand-emerald" />
                <span>P2P Protection Shield</span>
              </li>
              <li>
                <Link href="/admin" className="hover:text-brand-emerald transition-colors text-xs text-slate-400">
                  Admin Verification Portal
                </Link>
              </li>
              <li>
                <Link href="/admin/payments" className="hover:text-brand-emerald transition-colors text-xs text-slate-400">
                  Audit Ledger
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-brand-navy-light/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} VahanLoop Mobility Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-brand-emerald transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-brand-emerald transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-brand-emerald transition-colors">
              Guest Protection
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
