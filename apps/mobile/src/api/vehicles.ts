import { apiClient } from './client';
import { Vehicle } from '@vahanloop/shared';

export interface VehicleSearchParams {
  category?: string;
  location?: string;
  rentalType?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export async function getVehicles(params: VehicleSearchParams = {}): Promise<Vehicle[]> {
  const queryParams: Record<string, any> = {};
  if (params.category && params.category !== 'ALL') queryParams.category = params.category;
  if (params.location && params.location !== 'All Cities') queryParams.location = params.location;
  if (params.rentalType && params.rentalType !== 'ALL') queryParams.rentalType = params.rentalType;
  if (params.search) queryParams.search = params.search;
  if (params.sort) queryParams.sort = params.sort;

  const res = await apiClient<{ vehicles: Vehicle[] }>('/api/vehicles', {
    params: queryParams,
  });
  return res.vehicles || [];
}

export async function getVehicleDetails(id: string): Promise<Vehicle> {
  const res = await apiClient<{ vehicle: Vehicle }>(`/api/vehicles/${id}`);
  return res.vehicle;
}

export async function checkVehicleEligibility(id: string, rentalType: 'SELF_DRIVE' | 'CHAUFFEUR'): Promise<{
  eligible: boolean;
  missingRequirements?: string[];
  reasons?: string[];
}> {
  return apiClient(`/api/vehicles/${id}/eligibility`, {
    params: { rentalType },
  });
}
