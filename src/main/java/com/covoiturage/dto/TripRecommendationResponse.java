package com.covoiturage.dto;

import com.covoiturage.model.TripStatus;

import java.time.LocalDateTime;

public class TripRecommendationResponse {
    private final String tripId;
    private final String depart;
    private final String arrivee;
    private final LocalDateTime dateDepart;
    private final double prixParPlace;
    private final int placesDisponibles;
    private final TripStatus etat;
    private final double driverRating;
    private final double score;
    private final String explanation;

    public TripRecommendationResponse(String tripId,
                                      String depart,
                                      String arrivee,
                                      LocalDateTime dateDepart,
                                      double prixParPlace,
                                      int placesDisponibles,
                                      TripStatus etat,
                                      double driverRating,
                                      double score,
                                      String explanation) {
        this.tripId = tripId;
        this.depart = depart;
        this.arrivee = arrivee;
        this.dateDepart = dateDepart;
        this.prixParPlace = prixParPlace;
        this.placesDisponibles = placesDisponibles;
        this.etat = etat;
        this.driverRating = driverRating;
        this.score = score;
        this.explanation = explanation;
    }

    public String getTripId() {
        return tripId;
    }

    public String getDepart() {
        return depart;
    }

    public String getArrivee() {
        return arrivee;
    }

    public LocalDateTime getDateDepart() {
        return dateDepart;
    }

    public double getPrixParPlace() {
        return prixParPlace;
    }

    public int getPlacesDisponibles() {
        return placesDisponibles;
    }

    public TripStatus getEtat() {
        return etat;
    }

    public double getDriverRating() {
        return driverRating;
    }

    public double getScore() {
        return score;
    }

    public String getExplanation() {
        return explanation;
    }
}
