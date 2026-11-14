'use client';

import React from 'react';
import { FilterState, VehicleCategory, RentalType, FuelType, Transmission } from '@/types';
import { Search, RotateCcw, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

interface VehicleFilterProps {
  filters: FilterState;
  onChange: (updated: FilterState) => void;
  onReset: () => void;
  locations: string[];
}

export const VehicleFilter: React.FC<VehicleFilterProps> = ({
  filters,
  onChange,
  onReset,
  locations,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-5">
      {/* Search Input */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Search Vehicles
        </label>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
            placeholder="Search by model (e.g. Nexon, Classic, Activa)..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50/50"
          />
        </div>
      </div>

      {/* Category Selection */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Vehicle Category
        </label>
        <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1 rounded-xl">
          {[
            { id: 'all', label: 'All' },
            { id: 'car', label: 'Cars' },
            { id: 'bike', label: 'Bikes' },
            { id: 'scooter', label: 'Scooters' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => onChange({ ...filters, category: cat.id as VehicleCategory | 'all' })}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filters.category === cat.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rental Mode */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Rental Mode
        </label>
        <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl">
          {[
            { id: 'all', label: 'All Modes' },
            { id: 'self-drive', label: 'Self Drive' },
            { id: 'with-driver', label: 'With Chauffeur' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => onChange({ ...filters, rentalType: mode.id as RentalType | 'all' })}
              className={`py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                filters.rentalType === mode.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Location Filter */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          City / Area
        </label>
        <select
          value={filters.location}
          onChange={(e) => onChange({ ...filters, location: e.target.value })}
          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All Locations</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range Slider / Inputs */}
      <div>
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          <span>Max Daily Price</span>
          <span className="text-emerald-700 font-extrabold text-sm">
            ₹{filters.maxPrice.toLocaleString('en-IN')}
          </span>
        </div>
        <input
          type="range"
          min="400"
          max="6000"
          step="100"
          value={filters.maxPrice}
          onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
          className="w-full accent-emerald-600 cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-slate-400 mt-1">
          <span>₹400/day</span>
          <span>₹6,000/day</span>
        </div>
      </div>

      {/* Fuel & Transmission Row */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            Fuel Type
          </label>
          <select
            value={filters.fuelType}
            onChange={(e) => onChange({ ...filters, fuelType: e.target.value as FuelType | 'all' })}
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50"
          >
            <option value="all">Any Fuel</option>
            <option value="petrol">Petrol</option>
            <option value="diesel">Diesel</option>
            <option value="electric">Electric</option>
            <option value="cng">CNG</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            Transmission
          </label>
          <select
            value={filters.transmission}
            onChange={(e) =>
              onChange({ ...filters, transmission: e.target.value as Transmission | 'all' })
            }
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50"
          >
            <option value="all">Any</option>
            <option value="manual">Manual</option>
            <option value="automatic">Automatic</option>
          </select>
        </div>
      </div>

      {/* Reset Button */}
      <div className="pt-2">
        <button
          onClick={onReset}
          className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Clear All Filters
        </button>
      </div>
    </div>
  );
};
