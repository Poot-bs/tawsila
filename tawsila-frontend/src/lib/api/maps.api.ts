import { apiClient } from './client';
import type { MapGeocodeResult, MapRouteResponse } from '@/types';

export const mapsApi = {
  geocode(query: string) {
    const qs = new URLSearchParams({ query });
    return apiClient.get<MapGeocodeResult[]>(`/maps/geocode?${qs.toString()}`);
  },

  route(from: string, to: string) {
    const qs = new URLSearchParams({ from, to });
    return apiClient.get<MapRouteResponse>(`/maps/route?${qs.toString()}`);
  },
};
