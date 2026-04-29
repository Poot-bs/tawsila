import { apiClient } from './client';
import type { SystemHealth } from '@/types';

export const systemApi = {
  health() {
    return apiClient.get<SystemHealth>('/system/health');
  },
};
