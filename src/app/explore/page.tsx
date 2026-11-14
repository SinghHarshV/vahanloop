'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMarketplace } from '@/context/MarketplaceContext';
import { VehicleCard } from '@/components/vehicles/VehicleCard';
import { VehicleFilter } from '@/components/vehicles/VehicleFilter';
import { FilterState, VehicleCategory, RentalType, FuelType, Transmission } from '@/types';
import { SlidersHorizontal, ArrowUpDown, Car, SearchX } from 'lucide-react';

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

        // Max price
        if (v.dailyRate > filters.maxPrice) return false;

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'price_low') return a.dailyRate - b.dailyRate;
        if (filters.sortBy === 'price_high') return b.dailyRate - a.dailyRate;
        if (filters.sortBy === 'rating') return b.ownerRating - a.ownerRating;
        return 0; // recommended
      });
  }, [approvedVehicles, filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Explore Available Vehicles
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Showing <strong className="text-slate-800">{filteredVehicles.length}</strong> verified{' '}
            {filteredVehicles.length === 1 ? 'vehicle' : 'vehicles'} ready for immediate booking.
          </p>
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl shadow-sm text-slate-700"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters {filters.category !== 'all' ? '(Active)' : ''}
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">Sort By:</span>
            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  sortBy: e.target.value as 'recommended' | 'price_low' | 'price_high' | 'rating',
                })
              }
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="recommended">Recommended</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Host Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar Filters + Vehicles List */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-8">
        {/* Desktop Sidebar Filter */}
        <div className="hidden md:block md:col-span-1">
          <div className="sticky top-24">
            <VehicleFilter
              filters={filters}
              onChange={setFilters}
              onReset={handleResetFilters}
              locations={uniqueLocations}
            />
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        {showMobileFilters && (
          <div className="md:hidden col-span-1">
            <VehicleFilter
              filters={filters}
              onChange={(f) => {
                setFilters(f);
                setShowMobileFilters(false);
              }}
              onReset={handleResetFilters}
              locations={uniqueLocations}
            />
          </div>
        )}

        {/* Vehicle Cards Grid */}
        <div className="md:col-span-3">
          {filteredVehicles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                <SearchX className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No matching vehicles found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try widening your price range, clearing some filters, or switching categories to see
                more available rides.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-xl hover:bg-emerald-600 transition-colors"
              >
                Reset All Filters
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
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-slate-500">
          Loading vehicle catalogue...
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}
