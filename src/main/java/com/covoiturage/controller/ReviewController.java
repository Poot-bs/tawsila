package com.covoiturage.controller;

import com.covoiturage.dto.DriverRatingSummary;
import com.covoiturage.dto.ReviewCreateRequest;
import com.covoiturage.model.Review;
import com.covoiturage.model.UserRole;
import com.covoiturage.security.AccessControlService;
import com.covoiturage.service.ReviewService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ReviewController {
    private final ReviewService reviewService;
    private final AccessControlService accessControlService;

    public ReviewController(ReviewService reviewService, AccessControlService accessControlService) {
        this.reviewService = reviewService;
        this.accessControlService = accessControlService;
    }

    @PostMapping("/reviews")
    public Review createReview(@RequestBody ReviewCreateRequest request) {
        accessControlService.requireRole(UserRole.PASSAGER);
        accessControlService.requireSelfOrRole(request.getPassagerId(), UserRole.ADMIN);
        return reviewService.createReview(request);
    }

    @GetMapping("/drivers/{chauffeurId}/reviews")
    public List<Review> getDriverReviews(@PathVariable String chauffeurId) {
        return reviewService.getDriverReviews(chauffeurId);
    }

    @GetMapping("/drivers/{chauffeurId}/rating-summary")
    public DriverRatingSummary getDriverSummary(@PathVariable String chauffeurId) {
        return reviewService.getDriverSummary(chauffeurId);
    }
}
