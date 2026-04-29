package com.covoiturage.dto;

import java.util.List;

public class MapRouteResponse {
    private final MapGeocodeResult from;
    private final MapGeocodeResult to;
    private final double distanceKm;
    private final double durationMinutes;
    private final List<List<Double>> geometry;

    public MapRouteResponse(
        MapGeocodeResult from,
        MapGeocodeResult to,
        double distanceKm,
        double durationMinutes,
        List<List<Double>> geometry
    ) {
        this.from = from;
        this.to = to;
        this.distanceKm = distanceKm;
        this.durationMinutes = durationMinutes;
        this.geometry = geometry;
    }

    public MapGeocodeResult getFrom() {
        return from;
    }

    public MapGeocodeResult getTo() {
        return to;
    }

    public double getDistanceKm() {
        return distanceKm;
    }

    public double getDurationMinutes() {
        return durationMinutes;
    }

    public List<List<Double>> getGeometry() {
        return geometry;
    }
}
