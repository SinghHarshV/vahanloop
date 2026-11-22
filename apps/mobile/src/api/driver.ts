import { apiClient } from './client';
import { DriverAssignment } from '@vahanloop/shared';

export async function getDriverAssignments(): Promise<DriverAssignment[]> {
  const res = await apiClient<{ assignments: DriverAssignment[] }>('/api/drivers/assignments');
  return res.assignments || [];
}

export async function updateDriverTripStatus(
  assignmentId: string,
  status: 'EN_ROUTE' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED',
  notes?: string
): Promise<{ success: boolean; assignment: DriverAssignment }> {
  return apiClient('/api/drivers/assignments', {
    method: 'PATCH',
    body: JSON.stringify({ assignmentId, status, notes }),
  });
}
