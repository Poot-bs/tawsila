package com.covoiturage.controller;

import com.covoiturage.dto.TripRecommendationResponse;
import com.covoiturage.service.TripRecommendationService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {
    private final TripRecommendationService tripRecommendationService;

    public RecommendationController(TripRecommendationService tripRecommendationService) {
        this.tripRecommendationService = tripRecommendationService;
    }

    @GetMapping("/trips")
    public List<TripRecommendationResponse> recommendTrips(
        @RequestParam String userId,
        @RequestParam(required = false) String depart,
        @RequestParam(required = false) String arrivee,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime preferredDepartureTime,
        @RequestParam(required = false) Double maxBudget,
        @RequestParam(defaultValue = "5") int limit
    ) {
        return tripRecommendationService.recommendTrips(
            userId,
            depart,
            arrivee,
            preferredDepartureTime,
            maxBudget,
            limit
        );
    }
}
