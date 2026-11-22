import { apiClient } from './client';
import { NotificationItem } from '@vahanloop/shared';
import { Platform } from 'react-native';

export async function getNotifications(): Promise<NotificationItem[]> {
  const res = await apiClient<{ notifications: NotificationItem[] }>('/api/notifications');
  return res.notifications || [];
}

export async function markNotificationRead(notificationId?: string, markAll = false): Promise<void> {
  await apiClient('/api/notifications', {
    method: 'PATCH',
    body: JSON.stringify({ notificationId, markAllRead: markAll }),
  });
}

export async function registerPushDeviceToken(pushToken: string): Promise<void> {
  await apiClient('/api/notifications', {
    method: 'POST',
    body: JSON.stringify({
      pushToken,
      platform: Platform.OS,
      deviceName: `${Platform.OS.toUpperCase()} Mobile Device`,
    }),
  });
}
