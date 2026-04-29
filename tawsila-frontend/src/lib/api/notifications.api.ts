import { apiClient } from './client';
import type { Notification } from '@/types';

export const notificationsApi = {
  /** Get all notifications for a user */
  getAll(userId: string) {
    return apiClient.get<Notification[]>(`/users/${userId}/notifications`);
  },
};
