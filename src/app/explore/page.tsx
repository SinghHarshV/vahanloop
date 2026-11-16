'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMarketplace } from '@/context/MarketplaceContext';
import { VehicleCard } from '@/components/vehicles/VehicleCard';
import { VehicleFilter } from '@/components/vehicles/VehicleFilter';
import { FilterState, VehicleCategory, RentalType, FuelType, Transmission } from '@/types';
import { SlidersHorizontal, ArrowUpDown, Car, SearchX, MapPin, Sparkles, Filter } from 'lucide-react';

function ExploreContent() {
  const searchParams = useSearchParams();
  const { approvedVehicles } = useMarketplace();

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Initialize filter state with URL params
  const [filters, setFilters] = useState<FilterState>({
    category: (searchParams.get('category') as VehicleCategory) || 'all',
    searchQuery: searchParams.get('q') || '',
    location: searchParams.get('location') || 'all',
    rentalType: (searchParams.get('rentalType') as RentalType) || 'all',
    fuelType: 'all',
    transmission: 'all',
    minPrice: 0,
    maxPrice: 6000,
    sortBy: 'recommended',
  });

  // Extract unique locations for dropdown
  const uniqueLocations = useMemo(() => {
    const locs = new Set<string>();
    approvedVehicles.forEach((v) => {
      if (v.location) locs.add(v.location);
    });
    return Array.from(locs);
  }, [approvedVehicles]);

  const handleResetFilters = () => {
    setFilters({
      category: 'all',
      searchQuery: '',
      location: 'all',
      rentalType: 'all',
      fuelType: 'all',
      transmission: 'all',
      minPrice: 0,
      maxPrice: 6000,
      sortBy: 'recommended',
    });
  };

  // Filter and sort computation
  const filteredVehicles = useMemo(() => {
    return approvedVehicles
      .filter((v) => {
        // Category
        if (filters.category !== 'all' && v.category !== filters.category) return false;

        // Search query
        if (filters.searchQuery) {
          const q = filters.searchQuery.toLowerCase();
          const matches =
            v.title.toLowerCase().includes(q) ||
            v.manufacturer.toLowerCase().includes(q) ||
            v.model.toLowerCase().includes(q) ||
            v.location.toLowerCase().includes(q);
          if (!matches) return false;
        }

        // Location
        if (filters.location !== 'all' && v.location !== filters.location) return false;

        // Rental mode
        if (filters.rentalType !== 'all') {
          if (!v.supportedModes.includes(filters.rentalType)) return false;
        }

        // Fuel type
        if (filters.fuelType !== 'all' && v.fuelType !== filters.fuelType) return false;

        // Transmission
        if (filters.transmission !== 'all' && v.transmission !== filters.transmission) return false;

        // Price range
        if (v.dailyRate > filters.maxPrice) return false;

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'price_low') return a.dailyRate - b.dailyRate;
        if (filters.sortBy === 'price_high') return b.dailyRate - a.dailyRate;
        if (filters.sortBy === 'rating') return b.ownerRating - a.ownerRating;
        return 0; // recommended default order
      });
  }, [approvedVehicles, filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Header Banner */}
      <div className="bg-brand-navy rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-premium border border-brand-navy-light/40">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/20 mb-3 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-brand-emerald" />
            <span>Verified Fleet Inventory</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-display font-extrabold tracking-tight">
            Explore Available Vehicles
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300">
            Compare hatchbacks, luxury sedans, adventure bikes and city scooters with instant live quotation.
          </p>
        </div>
      </div>

      {/* Top Controls Bar */}
      <div className="bg-white rounded-2xl p-4 border border-brand-border shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-brand-text-muted">
          <span className="font-bold text-brand-navy text-sm">{filteredVehicles.length}</span>
          <span>vehicles matching your search criteria</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-brand-surface border border-brand-border text-brand-navy hover:bg-slate-200/60"
          >
            <Filter className="w-3.5 h-3.5 text-brand-emerald" />
            <span>Filters</span>
          </button>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-brand-text-muted" />
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-brand-border bg-brand-surface text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-emerald"
            >
              <option value="recommended">Recommended</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Highest Rated Host</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid with Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block lg:col-span-1 sticky top-24">
          <VehicleFilter
            filters={filters}
            onChange={setFilters}
            onReset={handleResetFilters}
            locations={uniqueLocations}
          />
        </div>

        {/* Mobile Filter Sheet */}
        {showMobileFilters && (
          <div className="lg:hidden col-span-1">
            <VehicleFilter
              filters={filters}
              onChange={setFilters}
              onReset={handleResetFilters}
              locations={uniqueLocations}
            />
          </div>
        )}

        {/* Vehicle Cards Grid */}
        <div className="lg:col-span-3">
          {filteredVehicles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-brand-border p-12 text-center shadow-card space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-brand-surface flex items-center justify-center mx-auto text-brand-text-muted">
                <SearchX className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h3 className="text-lg font-display font-bold text-brand-navy">
                No vehicles matched your current filters
              </h3>
              <p className="text-xs text-brand-text-muted max-w-md mx-auto">
                Try widening your price range, clearing the location filter, or switching between Cars, Bikes and Scooters.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-2 px-5 py-2.5 rounded-full text-xs font-bold bg-brand-navy hover:bg-brand-emerald text-white transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-brand-text-muted">Loading explore catalog...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
