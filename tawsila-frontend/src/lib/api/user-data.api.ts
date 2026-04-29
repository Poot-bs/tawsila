import { apiClient } from './client';
import type { PaymentMethod, Vehicule } from '@/types';

export interface VehicleCreateRequest {
  chauffeurId: string;
  marque: string;
  modele: string;
  immatriculation: string;
  capacite: number;
}

export interface PaymentMethodCreateRequest {
  passagerId: string;
  holderName: string;
  type: string;
  cardLast4: string;
}

export const userDataApi = {
  addVehicle(data: VehicleCreateRequest) {
    return apiClient.post<Vehicule>('/users/vehicles', data);
  },

  getVehicles(chauffeurId: string) {
    return apiClient.get<Vehicule[]>(`/users/${chauffeurId}/vehicles`);
  },

  addPaymentMethod(data: PaymentMethodCreateRequest) {
    return apiClient.post<PaymentMethod>('/users/payment-methods', data);
  },

  getPaymentMethods(passagerId: string) {
    return apiClient.get<PaymentMethod[]>(`/users/${passagerId}/payment-methods`);
  },

  /** Legacy 1–5 star rating (query params) */
  rateDriver(passagerId: string, chauffeurId: string, note: number) {
    const q = new URLSearchParams({
      passagerId,
      chauffeurId,
      note: String(note),
    });
    return apiClient.post<void>(`/users/rate-driver?${q.toString()}`);
  },

  /** Average of legacy driver ratings */
  getDriverLegacyRating(chauffeurId: string) {
    return apiClient.get<number>(`/users/${chauffeurId}/rating`);
  },
};
