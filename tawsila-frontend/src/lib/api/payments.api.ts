import { apiClient } from './client';
import type { PaymentIntentRequest, PaymentRecord } from '@/types';

export const paymentsApi = {
  createIntent(data: PaymentIntentRequest) {
    return apiClient.post<PaymentRecord>('/payments/intents', data);
  },

  confirm(id: string) {
    return apiClient.post<PaymentRecord>(`/payments/${id}/confirm`);
  },

  refund(id: string) {
    return apiClient.post<PaymentRecord>(`/payments/${id}/refund`);
  },

  getById(id: string) {
    return apiClient.get<PaymentRecord>(`/payments/${id}`);
  },
};
