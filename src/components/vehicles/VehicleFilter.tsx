'use client';

import React from 'react';
import { FilterState, VehicleCategory, RentalType, FuelType, Transmission } from '@/types';
import { Search, RotateCcw, SlidersHorizontal, ArrowUpDown, Fuel, Gauge, Sparkles } from 'lucide-react';

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
    <div className="bg-white rounded-3xl border border-brand-border p-6 shadow-card space-y-6">
      {/* Header with clear button */}
      <div className="flex items-center justify-between pb-3 border-b border-brand-border">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-brand-emerald" />
          <span className="font-display font-bold text-sm text-brand-navy">Filters</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-brand-text-muted hover:text-brand-danger flex items-center gap-1 font-semibold transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Reset All
        </button>
      </div>

      {/* Search Input */}
      <div>
        <label className="block text-[11px] font-bold text-brand-text-muted uppercase tracking-wider mb-2">
          Keyword Search
        </label>
        <div className="relative">
          <Search className="w-4 h-4 text-brand-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
            placeholder="Search model, brand or city..."
            className="w-full pl-10 pr-3.5 py-2.5 text-xs font-medium rounded-2xl border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-emerald bg-brand-surface/70 text-brand-navy"
          />
        </div>
      </div>

      {/* Category Selection */}
      <div>
        <label className="block text-[11px] font-bold text-brand-text-muted uppercase tracking-wider mb-2">
          Category
        </label>
        <div className="grid grid-cols-4 gap-1.5 bg-brand-surface p-1.5 rounded-2xl border border-brand-border/60">
          {[
            { id: 'all', label: 'All' },
            { id: 'car', label: 'Cars' },
            { id: 'bike', label: 'Bikes' },
            { id: 'scooter', label: 'Scooters' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => onChange({ ...filters, category: cat.id as VehicleCategory | 'all' })}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                filters.category === cat.id
                  ? 'bg-brand-navy text-white shadow-sm'
                  : 'text-brand-text-muted hover:text-brand-navy'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rental Mode */}
      <div>
        <label className="block text-[11px] font-bold text-brand-text-muted uppercase tracking-wider mb-2">
          Rental Option
        </label>
        <div className="grid grid-cols-3 gap-1.5 bg-brand-surface p-1.5 rounded-2xl border border-brand-border/60">
          {[
            { id: 'all', label: 'All Modes' },
            { id: 'self-drive', label: 'Self Drive' },
            { id: 'with-driver', label: 'Chauffeur' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => onChange({ ...filters, rentalType: mode.id as RentalType | 'all' })}
              className={`py-2 text-[11px] font-bold rounded-xl transition-all ${
                filters.rentalType === mode.id
                  ? 'bg-brand-emerald text-white shadow-sm'
                  : 'text-brand-text-muted hover:text-brand-navy'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* City / Hub Selection */}
      <div>
        <label className="block text-[11px] font-bold text-brand-text-muted uppercase tracking-wider mb-2">
          Pickup Hub / City
        </label>
        <select
          value={filters.location}
          onChange={(e) => onChange({ ...filters, location: e.target.value })}
          className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-2xl border border-brand-border bg-brand-surface/70 text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-emerald"
        >
          <option value="all">All Locations in India</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      {/* Fuel Type */}
      <div>
        <label className="block text-[11px] font-bold text-brand-text-muted uppercase tracking-wider mb-2">
          Fuel Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'all', label: 'Any Fuel' },
            { id: 'petrol', label: 'Petrol' },
            { id: 'diesel', label: 'Diesel' },
            { id: 'electric', label: 'Electric (EV)' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => onChange({ ...filters, fuelType: f.id as FuelType | 'all' })}
              className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                filters.fuelType === f.id
                  ? 'border-brand-navy bg-brand-navy text-white font-bold'
                  : 'border-brand-border bg-white text-brand-text-muted hover:border-brand-border-dark'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transmission */}
      <div>
        <label className="block text-[11px] font-bold text-brand-text-muted uppercase tracking-wider mb-2">
          Transmission
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'all', label: 'Any' },
            { id: 'manual', label: 'Manual' },
            { id: 'automatic', label: 'Auto' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => onChange({ ...filters, transmission: t.id as Transmission | 'all' })}
              className={`py-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                filters.transmission === t.id
                  ? 'border-brand-navy bg-brand-navy text-white font-bold'
                  : 'border-brand-border bg-white text-brand-text-muted hover:border-brand-border-dark'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Slider */}
      <div className="pt-2 border-t border-brand-border">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] font-bold text-brand-text-muted uppercase tracking-wider">
            Max Daily Rate
          </label>
          <span className="text-xs font-bold text-brand-emerald">
            ₹{filters.maxPrice.toLocaleString('en-IN')}/day
          </span>
        </div>
        <input
          type="range"
          min="400"
          max="8000"
          step="200"
          value={filters.maxPrice}
          onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
          className="w-full accent-brand-emerald h-1.5 bg-slate-200 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-brand-text-muted mt-1.5 font-medium">
          <span>₹400</span>
          <span>₹4,000</span>
          <span>₹8,000+</span>
        </div>
      </div>
    </div>
  );
};
