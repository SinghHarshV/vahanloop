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
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { approvedVehicles } = useMarketplace();

  // Search section state
  const [location, setLocation] = useState('Indiranagar, Bengaluru');
  const [category, setCategory] = useState<VehicleCategory | 'all'>('all');
  const [rentalType, setRentalType] = useState<RentalType | 'all'>('all');

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
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Generation Peer-to-Peer Mobility</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              Find your <span className="text-emerald-400">perfect ride.</span>
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
              Rent cars and bikes from verified vehicle partners near you. Transparent pricing,
              instant requests, and flexible self-drive or chauffeur options.
            </p>
          </div>

          {/* Unified Search Box */}
          <div className="mt-10 bg-white rounded-3xl p-4 sm:p-6 shadow-2xl border border-slate-100 text-slate-900 max-w-5xl">
            <form onSubmit={handleHeroSearch} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Location */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Pickup Location
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/70 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Indiranagar, Bengaluru">Indiranagar, Bengaluru</option>
                      <option value="Koramangala, Bengaluru">Koramangala, Bengaluru</option>
                      <option value="HSR Layout, Bengaluru">HSR Layout, Bengaluru</option>
                      <option value="Whitefield, Bengaluru">Whitefield, Bengaluru</option>
                    </select>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Vehicle Category
                  </label>
                  <div className="relative">
                    <Car className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as VehicleCategory | 'all')}
                      className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/70 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="all">All Vehicles (Cars & Bikes)</option>
                      <option value="car">Cars Only</option>
                      <option value="bike">Motorcycles</option>
                      <option value="scooter">Automatic Scooters</option>
                    </select>
                  </div>
                </div>

                {/* Rental Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Rental Mode
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={rentalType}
                      onChange={(e) => setRentalType(e.target.value as RentalType | 'all')}
                      className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/70 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="all">Self-Drive & With Driver</option>
                      <option value="self-drive">Self-Drive Only</option>
                      <option value="with-driver">With Chauffeur / Driver</option>
                    </select>
                  </div>
                </div>

                {/* Submit button */}
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-3 px-6 rounded-xl font-bold text-xs sm:text-sm bg-slate-900 text-white hover:bg-emerald-600 transition-colors shadow-lg flex items-center justify-center gap-2 group"
                  >
                    <Search className="w-4 h-4 text-emerald-400 group-hover:text-white" />
                    Explore Available Fleet
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Browse by Category
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Choose from verified hatchbacks, sedans, SUVs, cruisers, or city scooters.
            </p>
          </div>
          <Link
            href="/explore"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            View all categories <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/explore?category=car"
            className="group relative bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Car className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                Cars & SUVs
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Hyundai i20, Maruti Baleno, Tata Nexon, Honda City & more. Available in manual and
                automatic transmissions.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between text-xs font-semibold text-slate-700 pt-4 border-t border-slate-100">
              <span>From ₹1,650/day</span>
              <span className="text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Explore Cars &rarr;
              </span>
            </div>
          </Link>

          <Link
            href="/explore?category=bike"
            className="group relative bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Bike className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                Motorcycles
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Royal Enfield Classic 350, Yamaha FZ-S & agile roadsters. Complete with dual ISI
                helmets for highway trips.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between text-xs font-semibold text-slate-700 pt-4 border-t border-slate-100">
              <span>From ₹750/day</span>
              <span className="text-amber-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Explore Bikes &rarr;
              </span>
            </div>
          </Link>

          <Link
            href="/explore?category=scooter"
            className="group relative bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                Automatic Scooters
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Honda Activa 6G, TVS Jupiter 125. Zippy, economical, and hassle-free for daily urban
                commuting.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between text-xs font-semibold text-slate-700 pt-4 border-t border-slate-100">
              <span>From ₹500/day</span>
              <span className="text-emerald-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Explore Scooters &rarr;
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Featured Vehicles Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
              <Award className="w-4 h-4" />
              <span>Verified Host Listings</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Featured Rides Near You
            </h2>
          </div>
          <Link
            href="/explore"
            className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-slate-800"
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

      {/* How VahanLoop Works */}
      <section className="bg-slate-100/70 border-y border-slate-200/80 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              How VahanLoop Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Simple 3-step rental experience designed for trust, convenience, and transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-extrabold flex items-center justify-center text-sm mb-4">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900">Search & Customise</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Filter by car, bike or scooter, self-drive or with-driver, fuel type, transmission,
                and price. View high-resolution photos and authentic specifications.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-sm mb-4">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900">Request & Confirm</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Choose dates and send your booking request. Once the vehicle partner accepts,
                simulate payment through UPI or NetBanking to lock in the reservation.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-extrabold flex items-center justify-center text-sm mb-4">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900">Pick Up & Enjoy</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Meet the verified partner at the pickup point, complete a swift digital checklist,
                and hit the open road with 24/7 road assistance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Become an Owner CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-4">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Monetise Your Underutilised Vehicle</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Turn your vehicle into a monthly earning asset.
            </h2>

            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              Cars and bikes sit parked for an average of 90% of their life. Register your vehicle
              on VahanLoop, set your own daily rates, and earn up to ₹35,000/month securely.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/owner/add-vehicle"
                className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow-lg flex items-center gap-2"
              >
                Register Vehicle Now
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/owner"
                className="px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                Explore Partner Portal
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
