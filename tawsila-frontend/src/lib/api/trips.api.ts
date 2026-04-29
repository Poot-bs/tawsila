import { apiClient } from './client';
import type { Trajet, TrajetCreateRequest, TripRecommendation, TripSearchParams } from '@/types';

export interface TripRecommendationsParams {
  userId: string;
  depart?: string;
  arrivee?: string;
  preferredDepartureTime?: string;
  maxBudget?: number;
  limit?: number;
}

export const tripsApi = {
  /** Search trips with optional filters */
  search(params?: TripSearchParams) {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query.set(key, String(value));
        }
      });
    }
    const qs = query.toString();
    return apiClient.get<Trajet[]>(`/trajets${qs ? `?${qs}` : ''}`);
  },

  /** Create a new trip (driver) */
  create(data: TrajetCreateRequest) {
    return apiClient.post<Trajet>('/trajets', data);
  },

  /** Close a trip (driver) */
  close(tripId: string) {
    return apiClient.post<Trajet>(`/trajets/${tripId}/close`);
  },

  /**
   * Personalized trip recommendations (requires auth).
   * Backend: GET /api/recommendations/trips?userId=...&optional filters
   */
  recommendations(params: TripRecommendationsParams) {
    const query = new URLSearchParams();
    query.set('userId', params.userId);
    if (params.depart) query.set('depart', params.depart);
    if (params.arrivee) query.set('arrivee', params.arrivee);
    if (params.preferredDepartureTime) {
      query.set('preferredDepartureTime', params.preferredDepartureTime);
    }
    if (params.maxBudget != null) query.set('maxBudget', String(params.maxBudget));
    if (params.limit != null) query.set('limit', String(params.limit));
    return apiClient.get<TripRecommendation[]>(`/recommendations/trips?${query.toString()}`);
  },
};
