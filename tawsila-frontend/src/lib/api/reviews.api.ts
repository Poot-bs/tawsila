import { apiClient } from './client';
import type { Review, ReviewCreateRequest, DriverRatingSummary } from '@/types';

export const reviewsApi = {
  /** Submit a new review for a driver */
  create(data: ReviewCreateRequest) {
    return apiClient.post<Review>('/reviews', data);
  },

  /** Get all reviews for a specific driver */
  getDriverReviews(chauffeurId: string) {
    return apiClient.get<Review[]>(`/drivers/${chauffeurId}/reviews`);
  },

  /** Get the rating summary for a driver */
  getDriverSummary(chauffeurId: string) {
    return apiClient.get<DriverRatingSummary>(`/drivers/${chauffeurId}/rating-summary`);
  },
};
