export interface AnalyticsOverview {
  totalUsers: number;
  totalTrips: number;
  totalReservations: number;
  totalRevenue: number;
  persistenceMode: string;
}

export interface ActiveDriver {
  driverId: string;
  driverName: string;
  tripCount: number;
  averageRating: number;
}
