package com.covoiturage.service;

import com.covoiturage.dto.TripRecommendationResponse;
import com.covoiturage.exception.ValidationException;
import com.covoiturage.model.Reservation;
import com.covoiturage.model.Trajet;
import com.covoiturage.model.TripStatus;
import com.covoiturage.repository.ReservationRepository;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
public class TripRecommendationService {
    private static final double WEIGHT_DISTANCE = 0.35;
    private static final double WEIGHT_PRICE = 0.25;
    private static final double WEIGHT_TIME = 0.20;
    private static final double WEIGHT_DRIVER_RATING = 0.20;

    private final TrajetService trajetService;
    private final ReservationRepository reservationRepository;

    public TripRecommendationService(TrajetService trajetService, ReservationRepository reservationRepository) {
        this.trajetService = trajetService;
        this.reservationRepository = reservationRepository;
    }

    public List<TripRecommendationResponse> recommendTrips(String userId,
                                                           String preferredDepart,
                                                           String preferredArrivee,
                                                           LocalDateTime preferredDepartureTime,
                                                           Double maxBudget,
                                                           int limit) {
        if (isBlank(userId)) {
            throw new ValidationException("userId est obligatoire pour les recommandations");
        }

        List<Reservation> history = reservationRepository.findByPassagerId(userId);
        List<Trajet> candidateTrips = trajetService.getTrajets(
            preferredDepart,
            preferredArrivee,
            null,
            null,
            maxBudget
        );

        double historicalAveragePrice = history.isEmpty()
            ? -1
            : history.stream().mapToDouble(Reservation::getMontant).average().orElse(-1);

        int historicalHourPreference = resolvePreferredHour(history, preferredDepartureTime);

        return candidateTrips.stream()
            .map(trip -> buildRecommendation(trip, history, historicalAveragePrice, historicalHourPreference, preferredDepart, preferredArrivee))
            .sorted(Comparator.comparingDouble(TripRecommendationResponse::getScore))
            .limit(Math.max(1, limit))
            .toList();
    }

    private TripRecommendationResponse buildRecommendation(Trajet trip,
                                                           List<Reservation> history,
                                                           double historicalAveragePrice,
                                                           int historicalHourPreference,
                                                           String preferredDepart,
                                                           String preferredArrivee) {
        double distanceScore = routeDistanceScore(trip, history, preferredDepart, preferredArrivee);
        double priceScore = priceScore(trip, historicalAveragePrice);
        double timeScore = timeScore(trip, historicalHourPreference);
        double driverRating = trip.getChauffeur().consulterNotesChauffeur();
        double ratingPenalty = 1.0 - normalizeDriverRating(driverRating);

        double score = (WEIGHT_DISTANCE * distanceScore)
            + (WEIGHT_PRICE * priceScore)
            + (WEIGHT_TIME * timeScore)
            + (WEIGHT_DRIVER_RATING * ratingPenalty);

        String explanation = String.format(
            Locale.US,
            "score=%.3f (distance=%.2f, prix=%.2f, temps=%.2f, chauffeur=%.2f)",
            score,
            distanceScore,
            priceScore,
            timeScore,
            driverRating
        );

        return new TripRecommendationResponse(
            trip.getId(),
            trip.getDepart(),
            trip.getArrivee(),
            trip.getDateDepart(),
            trip.getPrixParPlace(),
            trip.getPlacesDisponibles(),
            trip.getEtat(),
            driverRating,
            score,
            explanation
        );
    }

    private double routeDistanceScore(Trajet trip,
                                      List<Reservation> history,
                                      String preferredDepart,
                                      String preferredArrivee) {
        if (!isBlank(preferredDepart) || !isBlank(preferredArrivee)) {
            return routeSimilarityPenalty(trip.getDepart(), trip.getArrivee(), preferredDepart, preferredArrivee);
        }

        if (history.isEmpty()) {
            return 0.5;
        }

        long exactMatches = history.stream()
            .filter(r -> r.getTrajet().getDepart().equalsIgnoreCase(trip.getDepart())
                && r.getTrajet().getArrivee().equalsIgnoreCase(trip.getArrivee()))
            .count();

        if (exactMatches > 0) {
            return 0.0;
        }

        long partialMatches = history.stream()
            .filter(r -> r.getTrajet().getDepart().equalsIgnoreCase(trip.getDepart())
                || r.getTrajet().getArrivee().equalsIgnoreCase(trip.getArrivee()))
            .count();

        return partialMatches > 0 ? 0.35 : 1.0;
    }

    private double routeSimilarityPenalty(String tripDepart, String tripArrivee, String preferredDepart, String preferredArrivee) {
        boolean departMatches = isBlank(preferredDepart) || tripDepart.equalsIgnoreCase(preferredDepart.trim());
        boolean arriveeMatches = isBlank(preferredArrivee) || tripArrivee.equalsIgnoreCase(preferredArrivee.trim());

        if (departMatches && arriveeMatches) {
            return 0.0;
        }
        if (departMatches || arriveeMatches) {
            return 0.4;
        }
        return 1.0;
    }

    private double priceScore(Trajet trip, double historicalAveragePrice) {
        if (historicalAveragePrice <= 0) {
            return Math.min(1.0, trip.getPrixParPlace() / 100.0);
        }
        double ratio = Math.abs(trip.getPrixParPlace() - historicalAveragePrice) / historicalAveragePrice;
        return Math.min(1.0, ratio);
    }

    private double timeScore(Trajet trip, int preferredHour) {
        int tripHour = trip.getDateDepart().getHour();
        int diff = Math.abs(tripHour - preferredHour);
        int circularDiff = Math.min(diff, 24 - diff);
        return Math.min(1.0, circularDiff / 12.0);
    }

    private double normalizeDriverRating(double rating) {
        if (rating <= 0) {
            return 0.5;
        }
        return Math.max(0.0, Math.min(1.0, rating / 5.0));
    }

    private int resolvePreferredHour(List<Reservation> history, LocalDateTime preferredDepartureTime) {
        if (preferredDepartureTime != null) {
            return preferredDepartureTime.getHour();
        }
        if (history.isEmpty()) {
            return LocalDateTime.now().plus(Duration.ofHours(2)).getHour();
        }
        return (int) Math.round(history.stream()
            .mapToInt(r -> r.getTrajet().getDateDepart().getHour())
            .average()
            .orElse(12.0));
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
