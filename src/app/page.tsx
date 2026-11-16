'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMarketplace } from '@/context/MarketplaceContext';
import { VehicleCard } from '@/components/vehicles/VehicleCard';
import { VehicleCategory, RentalType } from '@/types';
import {
  Car,
  Bike,
  Search,
  Calendar,
  MapPin,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  Award,
  ChevronRight,
  ShieldAlert,
  Fuel,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { approvedVehicles } = useMarketplace();

  // Search section state
  const [location, setLocation] = useState('Indiranagar, Bengaluru');
  const [category, setCategory] = useState<VehicleCategory | 'all'>('all');
  const [rentalType, setRentalType] = useState<RentalType | 'all'>('all');
  const [startDate, setStartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (category !== 'all') params.set('category', category);
    if (rentalType !== 'all') params.set('rentalType', rentalType);
    if (location) params.set('location', location);
    router.push(`/explore?${params.toString()}`);
  };

  const featuredVehicles = approvedVehicles.slice(0, 4);

  return (
    <div className="space-y-20 pb-20">
      {/* Virtuo-Inspired Hero Banner with Floating Search Pill */}
      <section className="relative px-3 sm:px-6 lg:px-8 pt-4">
        <div className="max-w-7xl mx-auto">
          {/* Curved Hero Frame */}
          <div className="relative rounded-3xl sm:rounded-[2.5rem] overflow-hidden bg-brand-navy shadow-floating min-h-[520px] sm:min-h-[580px] flex flex-col justify-between p-6 sm:p-12 lg:p-16 border border-brand-navy-light/40">
            {/* Background Photographic Image & Overlays */}
            <div className="absolute inset-0 z-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000&q=85"
                alt="Luxury Vehicle Road Trip"
                className="w-full h-full object-cover object-center opacity-45 brightness-90 saturate-125"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/60 to-brand-navy/30" />
              <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-emerald/15 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Top Brand Pill & Subtitle */}
            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/10 text-white backdrop-blur-md border border-white/20 mb-6 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-brand-emerald" />
                <span>Peer-to-Peer Mobility · Instant Digital Booking</span>
              </div>

              {/* Bold Virtuo-Style Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold tracking-tight text-white leading-[1.08]">
                Move Freely. <br />
                <span className="text-brand-emerald">Rent Smarter.</span>
              </h1>

              <p className="mt-5 text-base sm:text-xl text-slate-200 max-w-2xl font-normal leading-relaxed">
                Connect directly with verified individual owners and fleet hosts across India. Premium cars,
                open-road cruisers, and city scooters with zero hidden fees.
              </p>
            </div>

            {/* Quick Stat Badges */}
            <div className="relative z-10 pt-8 flex flex-wrap items-center gap-6 sm:gap-10 text-xs sm:text-sm text-slate-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-emerald" />
                <span className="font-semibold">RC & Insurance Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-emerald" />
                <span className="font-semibold">15-Min Guaranteed Hold</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-emerald" />
                <span className="font-semibold">Self-Drive & Chauffeur Modes</span>
              </div>
            </div>
          </div>

          {/* Floating Pill Search Bar Widget (Intersecting Banner) */}
          <div className="relative z-20 -mt-10 sm:-mt-12 max-w-5xl mx-auto px-2">
            <div className="bg-white rounded-2xl sm:rounded-full p-2.5 sm:p-3 shadow-floating border border-brand-border">
              <form onSubmit={handleHeroSearch} className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                {/* Location Input Segment */}
                <div className="flex-1 w-full sm:w-auto flex items-center gap-2.5 px-4 py-2.5 bg-brand-surface rounded-xl sm:rounded-full border border-brand-border/60 hover:border-brand-emerald transition-colors">
                  <MapPin className="w-4 h-4 text-brand-emerald shrink-0" />
                  <div className="flex-1 min-w-0">
                    <label className="block text-[10px] uppercase font-bold text-brand-text-muted leading-tight">
                      Where
                    </label>
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      aria-label="Select pickup city"
                      className="w-full bg-transparent text-xs font-bold text-brand-navy focus:outline-none cursor-pointer truncate"
                    >
                      <option value="Indiranagar, Bengaluru">Indiranagar, Bengaluru</option>
                      <option value="Koramangala, Bengaluru">Koramangala, Bengaluru</option>
                      <option value="HSR Layout, Bengaluru">HSR Layout, Bengaluru</option>
                      <option value="Whitefield, Bengaluru">Whitefield, Bengaluru</option>
                      <option value="Connaught Place, Delhi">Connaught Place, Delhi</option>
                      <option value="Cyber City, Gurugram">Cyber City, Gurugram</option>
                      <option value="Bandra West, Mumbai">Bandra West, Mumbai</option>
                      <option value="Panjim, Goa">Panjim, Goa</option>
                    </select>
                  </div>
                </div>

                {/* Category Segment */}
                <div className="w-full sm:w-48 flex items-center gap-2.5 px-4 py-2.5 bg-brand-surface rounded-xl sm:rounded-full border border-brand-border/60 hover:border-brand-emerald transition-colors">
                  <Car className="w-4 h-4 text-brand-emerald shrink-0" />
                  <div className="flex-1 min-w-0">
                    <label className="block text-[10px] uppercase font-bold text-brand-text-muted leading-tight">
                      Vehicle Type
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as VehicleCategory | 'all')}
                      aria-label="Select vehicle category"
                      className="w-full bg-transparent text-xs font-bold text-brand-navy focus:outline-none cursor-pointer"
                    >
                      <option value="all">All Fleet</option>
                      <option value="car">Cars Only</option>
                      <option value="bike">Motorcycles</option>
                      <option value="scooter">Scooters</option>
                    </select>
                  </div>
                </div>

                {/* Rental Mode Segment */}
                <div className="w-full sm:w-48 flex items-center gap-2.5 px-4 py-2.5 bg-brand-surface rounded-xl sm:rounded-full border border-brand-border/60 hover:border-brand-emerald transition-colors">
                  <Users className="w-4 h-4 text-brand-emerald shrink-0" />
                  <div className="flex-1 min-w-0">
                    <label className="block text-[10px] uppercase font-bold text-brand-text-muted leading-tight">
                      Rental Mode
                    </label>
                    <select
                      value={rentalType}
                      onChange={(e) => setRentalType(e.target.value as RentalType | 'all')}
                      aria-label="Select rental mode"
                      className="w-full bg-transparent text-xs font-bold text-brand-navy focus:outline-none cursor-pointer"
                    >
                      <option value="all">Any Mode</option>
                      <option value="self-drive">Self-Drive</option>
                      <option value="with-driver">With Chauffeur</option>
                    </select>
                  </div>
                </div>

                {/* Search Button */}
                <button
                  type="submit"
                  className="w-full sm:w-auto h-12 px-7 rounded-xl sm:rounded-full bg-brand-navy hover:bg-brand-emerald text-white font-bold text-sm flex items-center justify-center gap-2 shadow-floating transition-all duration-300 group shrink-0"
                >
                  <Search className="w-4 h-4 text-brand-emerald group-hover:text-white transition-colors" />
                  <span>Search Fleet</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Curated Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-emerald">
              Curated Mobility
            </span>
            <h2 className="text-2xl sm:text-4xl font-display font-extrabold text-brand-navy mt-1">
              Find the right ride for every journey
            </h2>
            <p className="text-sm text-brand-text-muted mt-1">
              Hand-picked verified inventory from top-rated local hosts and fleet managers.
            </p>
          </div>
          <Link
            href="/explore"
            className="text-xs font-bold text-brand-navy hover:text-brand-emerald flex items-center gap-1 transition-colors"
          >
            View all categories <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cars Card */}
          <Link
            href="/explore?category=car"
            className="group relative bg-white rounded-3xl p-7 border border-brand-border shadow-card hover:shadow-card-hover hover:border-brand-emerald transition-all duration-300 flex flex-col justify-between overflow-hidden"
          >
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-brand-navy text-brand-emerald flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Car className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-display font-bold text-brand-navy group-hover:text-brand-emerald transition-colors">
                Cars & Premium SUVs
              </h3>
              <p className="text-xs text-brand-text-muted mt-2 leading-relaxed">
                Hatchbacks, sedans, and luxury compact SUVs. Equipped with ABS, airbags, and verified digital RCs.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-brand-border flex items-center justify-between text-xs font-bold">
              <span className="text-brand-navy">Starting ₹1,650/day</span>
              <span className="text-brand-emerald flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Browse Cars <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>

          {/* Bikes Card */}
          <Link
            href="/explore?category=bike"
            className="group relative bg-white rounded-3xl p-7 border border-brand-border shadow-card hover:shadow-card-hover hover:border-brand-emerald transition-all duration-300 flex flex-col justify-between overflow-hidden"
          >
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-brand-surface text-brand-navy flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Bike className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-display font-bold text-brand-navy group-hover:text-brand-emerald transition-colors">
                Cruisers & Motorcycles
              </h3>
              <p className="text-xs text-brand-text-muted mt-2 leading-relaxed">
                Royal Enfield Classic 350, Yamaha MT & sports roadsters with dual ISI-certified helmets included.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-brand-border flex items-center justify-between text-xs font-bold">
              <span className="text-brand-navy">Starting ₹750/day</span>
              <span className="text-brand-emerald flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Browse Bikes <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>

          {/* Scooters Card */}
          <Link
            href="/explore?category=scooter"
            className="group relative bg-white rounded-3xl p-7 border border-brand-border shadow-card hover:shadow-card-hover hover:border-brand-emerald transition-all duration-300 flex flex-col justify-between overflow-hidden"
          >
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-brand-emerald-subtle text-brand-emerald flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-display font-bold text-brand-navy group-hover:text-brand-emerald transition-colors">
                City Scooters & Electric
              </h3>
              <p className="text-xs text-brand-text-muted mt-2 leading-relaxed">
                Honda Activa, TVS Jupiter & smart electric scooters for effortless, budget-friendly urban travel.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-brand-border flex items-center justify-between text-xs font-bold">
              <span className="text-brand-navy">Starting ₹500/day</span>
              <span className="text-brand-emerald flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Browse Scooters <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Featured Vehicles Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-emerald uppercase tracking-wider mb-1">
              <Award className="w-4 h-4" />
              <span>Available Right Now</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-display font-extrabold text-brand-navy">
              Featured Rides Near You
            </h2>
          </div>
          <Link
            href="/explore"
            className="px-4 py-2 text-xs font-bold bg-brand-surface hover:bg-slate-200/70 border border-brand-border rounded-xl transition-all text-brand-navy"
          >
            Browse Full Catalogue ({approvedVehicles.length})
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredVehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      </section>

      {/* 3-Step Trust Experience */}
      <section className="bg-white border-y border-brand-border py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-emerald">
              Streamlined Process
            </span>
            <h2 className="text-2xl sm:text-4xl font-display font-extrabold text-brand-navy mt-1">
              How VahanLoop works
            </h2>
            <p className="text-sm text-brand-text-muted mt-2">
              Simple 3-step rental experience built with zero paper bureaucracy and maximum security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-brand-surface rounded-3xl p-8 border border-brand-border shadow-card relative hover:border-brand-emerald transition-all">
              <div className="w-12 h-12 rounded-2xl bg-brand-navy text-white font-display font-extrabold flex items-center justify-center text-base mb-6">
                01
              </div>
              <h3 className="text-lg font-display font-bold text-brand-navy">Choose & Customise</h3>
              <p className="text-xs text-brand-text-muted mt-2.5 leading-relaxed">
                Filter by car, bike or scooter, self-drive or with-driver, fuel type, transmission,
                and price. View transparent price quotes with security deposit breakdown.
              </p>
            </div>

            <div className="bg-brand-surface rounded-3xl p-8 border border-brand-border shadow-card relative hover:border-brand-emerald transition-all">
              <div className="w-12 h-12 rounded-2xl bg-brand-emerald text-white font-display font-extrabold flex items-center justify-center text-base mb-6">
                02
              </div>
              <h3 className="text-lg font-display font-bold text-brand-navy">Request & Hold</h3>
              <p className="text-xs text-brand-text-muted mt-2.5 leading-relaxed">
                Host receives your request and accepts. The vehicle is automatically reserved on a 15-minute
                exclusive hold while you complete your test checkout.
              </p>
            </div>

            <div className="bg-brand-surface rounded-3xl p-8 border border-brand-border shadow-card relative hover:border-brand-emerald transition-all">
              <div className="w-12 h-12 rounded-2xl bg-brand-navy text-white font-display font-extrabold flex items-center justify-center text-base mb-6">
                03
              </div>
              <h3 className="text-lg font-display font-bold text-brand-navy">Inspect & Hit the Road</h3>
              <p className="text-xs text-brand-text-muted mt-2.5 leading-relaxed">
                Meet your host at pickup, complete the quick digital condition inspection checklist,
                and enjoy complete peace of mind with 24/7 roadside assistance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Become an Owner CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-navy rounded-3xl sm:rounded-[2.5rem] p-8 sm:p-14 text-white relative overflow-hidden shadow-floating border border-brand-navy-light/40">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-brand-emerald/20 text-brand-emerald-accent border border-brand-emerald/30 mb-5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Monetise Your Underutilised Asset</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight leading-tight">
              Turn your vehicle into a monthly earning powerhouse.
            </h2>

            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Private cars and bikes sit idle for over 90% of their lifespan. List your vehicle on VahanLoop,
              retain full control over rental dates and pricing, and earn up to ₹35,000/month securely.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/owner/add-vehicle"
                className="px-7 py-3.5 rounded-full font-bold text-xs sm:text-sm bg-brand-emerald hover:bg-brand-emerald-dark text-white transition-all shadow-floating flex items-center gap-2"
              >
                Register Your Vehicle Now
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/owner"
                className="px-7 py-3.5 rounded-full font-bold text-xs sm:text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all backdrop-blur-md"
              >
                Explore Host Portal
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
