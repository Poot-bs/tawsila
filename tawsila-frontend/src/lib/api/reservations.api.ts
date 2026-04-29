import { apiClient } from './client';
import type {
  Reservation,
  ReservationCreateRequest,
  ReservationTrackingItem,
  DriverRequestItem,
} from '@/types';

export const reservationsApi = {
  /** Create a reservation (passenger) */
  create(data: ReservationCreateRequest) {
    return apiClient.post<Reservation>('/reservations', data);
  },

  /** Confirm a reservation (driver) */
  confirm(reservationId: string, chauffeurId: string) {
    return apiClient.post<Reservation>(
      `/reservations/${reservationId}/confirm?chauffeurId=${chauffeurId}`
    );
  },

  /** Cancel a reservation */
  cancel(reservationId: string, initiateurId: string, initiateurChauffeur: boolean) {
    return apiClient.post<Reservation>(
      `/reservations/${reservationId}/cancel?initiateurId=${initiateurId}&initiateurChauffeur=${initiateurChauffeur}`
    );
  },

  /** Get all reservations */
  getAll() {
    return apiClient.get<Reservation[]>('/reservations');
  },

  /** Get passenger reservations */
  byPassenger(passagerId: string) {
    return apiClient.get<Reservation[]>(`/reservations/passager/${passagerId}`);
  },

  /** Get passenger reservations with tracking info */
  tracking(passagerId: string) {
    return apiClient.get<ReservationTrackingItem[]>(
      `/reservations/passager/${passagerId}/suivi`
    );
  },

  /** Get driver reservation requests */
  driverRequests(chauffeurId: string) {
    return apiClient.get<DriverRequestItem[]>(
      `/reservations/chauffeur/${chauffeurId}/demandes`
    );
  },
};
