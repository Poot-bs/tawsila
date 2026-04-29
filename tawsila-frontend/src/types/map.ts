export interface MapGeocodeResult {
  label: string;
  lat: number;
  lng: number;
}

export interface MapRouteResponse {
  from: MapGeocodeResult;
  to: MapGeocodeResult;
  distanceKm: number;
  durationMinutes: number;
  geometry: number[][];
}
