export type SimulatedPaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED';

export interface PaymentRecord {
  id: string;
  reservationId: string;
  payerId: string;
  method: string;
  amount: number;
  status: SimulatedPaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentIntentRequest {
  reservationId: string;
  payerId: string;
  method: string;
  amount: number;
}

export interface PaymentMethod {
  id: string;
  holderName: string;
  type: string;
  cardLast4: string;
}
