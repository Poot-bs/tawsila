export type ReservationStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'CANCELED'
  | 'REFUNDED_FULL'
  | 'REFUNDED_PARTIAL'
  | 'PENALIZED';

export type PaymentStatus =
  | 'AUTHORIZED'
  | 'CAPTURED'
  | 'REFUNDED_FULL'
  | 'REFUNDED_PARTIAL'
  | 'CANCELED';

export interface Reservation {
  id: string;
  trajet: {
    id: string;
    depart: string;
    arrivee: string;
    dateDepart: string;
    prixParPlace: number;
  };
  passager: {
    identifiant: string;
    nom: string;
    email: string;
  };
  moyenPaiement: {
    id: string;
    holderName: string;
    type: string;
    cardLast4: string;
  };
  montant: number;
  reservationStatus: ReservationStatus;
  paymentStatus: PaymentStatus;
  dateReservation: string;
}

export interface ReservationCreateRequest {
  passagerId: string;
  trajetId: string;
  moyenPaiementId: string;
}

export interface ReservationTrackingItem {
  reservationId: string;
  reservationStatus: ReservationStatus;
  paymentStatus: PaymentStatus;
  tripId: string;
  depart: string;
  arrivee: string;
  dateDepart: string;
  prixParPlace: number;
  chauffeurId: string;
  chauffeurNom: string;
  chauffeurEmail: string;
  canContactChauffeur: boolean;
}

export interface DriverRequestItem {
  reservationId: string;
  reservationStatus: ReservationStatus;
  paymentStatus: PaymentStatus;
  tripId: string;
  depart: string;
  arrivee: string;
  dateDepart: string;
  prixParPlace: number;
  passagerId: string;
  passagerNom: string;
  passagerEmail: string;
}

