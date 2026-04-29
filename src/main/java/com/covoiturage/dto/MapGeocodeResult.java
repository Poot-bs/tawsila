package com.covoiturage.dto;

public class MapGeocodeResult {
    private final String label;
    private final double lat;
    private final double lng;

    public MapGeocodeResult(String label, double lat, double lng) {
        this.label = label;
        this.lat = lat;
        this.lng = lng;
    }

    public String getLabel() {
        return label;
    }

    public double getLat() {
        return lat;
    }

    public double getLng() {
        return lng;
    }
}
