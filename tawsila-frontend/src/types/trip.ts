export type TripStatus = 'OPEN' | 'COMPLETE' | 'CLOSED' | 'CANCELED';

export interface Vehicule {
  id: string;
  marque: string;
  modele: string;
  immatriculation: string;
  capacite: number;
}

export interface Chauffeur {
  identifiant: string;
  nom: string;
  email: string;
  role: 'CHAUFFEUR';
  status: string;
}

export interface Trajet {
  id: string;
  chauffeur: Chauffeur;
  vehicule: Vehicule;
  depart: string;
  arrivee: string;
  dateDepart: string;
  placesMax: number;
  prixParPlace: number;
  etat: TripStatus;
  placesDisponibles: number;
  placesReservees: number;
  reservations?: unknown[];
}

export interface TrajetCreateRequest {
  chauffeurId: string;
  vehiculeId: string;
  depart: string;
  arrivee: string;
  dateDepart: string;
  placesMax: number;
  prixParPlace: number;
}

export interface TripSearchParams {
  depart?: string;
  arrivee?: string;
  dateMin?: string;
  dateMax?: string;
  prixMin?: number;
  prixMax?: number;
  seatsMin?: number;
  minDriverRating?: number;
  departureHourMin?: number;
  departureHourMax?: number;
}

/** Matches backend TripRecommendationResponse */
export interface TripRecommendation {
  tripId: string;
  depart: string;
  arrivee: string;
  dateDepart: string;
  prixParPlace: number;
  placesDisponibles: number;
  etat: TripStatus;
  driverRating: number;
  score: number;
  explanation: string;
}
