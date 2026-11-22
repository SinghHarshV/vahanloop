import { create } from 'zustand';
import { VehicleCategory, RentalType, FuelType, Transmission } from '@vahanloop/shared';

export interface FilterState {
  category: VehicleCategory | 'ALL';
  location: string;
  rentalType: RentalType | 'ALL';
  fuelType: FuelType | 'ALL';
  transmission: Transmission | 'ALL';
  minPrice: number;
  maxPrice: number;
  searchQuery: string;
  sortBy: 'recommended' | 'price_low' | 'price_high' | 'rating';

  // Actions
  setCategory: (category: VehicleCategory | 'ALL') => void;
  setLocation: (location: string) => void;
  setRentalType: (mode: RentalType | 'ALL') => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: 'recommended' | 'price_low' | 'price_high' | 'rating') => void;
  setPriceRange: (min: number, max: number) => void;
  resetFilters: () => void;
}

const initialFilters = {
  category: 'ALL' as const,
  location: 'All Cities',
  rentalType: 'ALL' as const,
  fuelType: 'ALL' as const,
  transmission: 'ALL' as const,
  minPrice: 0,
  maxPrice: 20000,
  searchQuery: '',
  sortBy: 'recommended' as const,
};

export const useFilterStore = create<FilterState>((set) => ({
  ...initialFilters,

  setCategory: (category) => set({ category }),
  setLocation: (location) => set({ location }),
  setRentalType: (rentalType) => set({ rentalType }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSortBy: (sortBy) => set({ sortBy }),
  setPriceRange: (minPrice, maxPrice) => set({ minPrice, maxPrice }),
  resetFilters: () => set(initialFilters),
}));
