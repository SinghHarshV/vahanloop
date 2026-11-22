import { apiClient } from './client';
import { Vehicle, Booking, OwnerEarningsSummary } from '@vahanloop/shared';

export interface OwnerDashboardData {
  metrics: {
    totalVehicles: number;
    activeListings: number;
    pendingBookings: number;
    totalEarnings: number;
    completedTrips: number;
  };
  recentRequests: Booking[];
}

export async function getOwnerDashboard(): Promise<OwnerDashboardData> {
  return apiClient('/api/owner/dashboard');
}

export async function getOwnerVehicles(): Promise<Vehicle[]> {
  const res = await apiClient<{ vehicles: Vehicle[] }>('/api/owner/vehicles');
  return res.vehicles || [];
}

export async function addOwnerVehicle(vehicleData: any): Promise<Vehicle> {
  const res = await apiClient<{ vehicle: Vehicle }>('/api/owner/vehicles', {
    method: 'POST',
    body: JSON.stringify(vehicleData),
  });
  return res.vehicle;
}

export async function getOwnerBookings(status?: string): Promise<Booking[]> {
  const res = await apiClient<{ bookings: Booking[] }>('/api/owner/bookings', {
    params: status ? { status } : undefined,
  });
  return res.bookings || [];
}

export async function acceptBooking(bookingId: string): Promise<{ success: boolean; booking: Booking }> {
  return apiClient(`/api/bookings/${bookingId}/accept`, {
    method: 'POST',
  });
}

export async function rejectBooking(bookingId: string, reason: string): Promise<{ success: boolean; booking: Booking }> {
  return apiClient(`/api/bookings/${bookingId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export async function getOwnerEarnings(): Promise<OwnerEarningsSummary> {
  const res = await apiClient<{ earnings: OwnerEarningsSummary }>('/api/owner/earnings');
  return res.earnings;
}

export async function submitOwnerOnboarding(data: {
  ownerType: 'INDIVIDUAL' | 'BUSINESS';
  businessName?: string;
  panNumber: string;
  gstin?: string;
}): Promise<{ success: boolean; message: string }> {
  return apiClient('/api/owner/onboarding', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
