export interface Review {
  id: string;
  reservationId: string;
  passagerId: string;
  chauffeurId: string;
  stars: number;
  comment: string;
  createdAt: string;
}

export interface ReviewCreateRequest {
  reservationId: string;
  passagerId: string;
  chauffeurId: string;
  stars: number;
  comment?: string;
}

export interface DriverRatingSummary {
  chauffeurId: string;
  averageRating: number;
  reviewsCount: number;
  topDriver: boolean;
}
