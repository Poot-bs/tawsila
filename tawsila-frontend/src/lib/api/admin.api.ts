import { apiClient } from './client';
import type { Trajet } from '@/types';
import type { User } from '@/types';

export const adminApi = {
  /** Get dashboard summary */
  dashboard() {
    return apiClient.get<Record<string, unknown>>('/admin/dashboard');
  },

  /** Get all users (admin) */
  users() {
    return apiClient.get<User[]>('/admin/users');
  },

  /** Get all trips (admin) */
  trips() {
    return apiClient.get<Trajet[]>('/admin/trips');
  },

  /** Suspend a user account */
  suspendUser(userId: string) {
    return apiClient.post<User>(`/admin/users/${userId}/suspend`);
  },

  /** Block a user account */
  blockUser(userId: string) {
    return apiClient.post<User>(`/admin/users/${userId}/block`);
  },
};
