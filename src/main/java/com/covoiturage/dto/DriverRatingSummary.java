package com.covoiturage.dto;

public class DriverRatingSummary {
    private final String chauffeurId;
    private final double averageRating;
    private final int reviewsCount;
    private final boolean topDriver;

    public DriverRatingSummary(String chauffeurId, double averageRating, int reviewsCount, boolean topDriver) {
        this.chauffeurId = chauffeurId;
        this.averageRating = averageRating;
        this.reviewsCount = reviewsCount;
        this.topDriver = topDriver;
    }

    public String getChauffeurId() {
        return chauffeurId;
    }

    public double getAverageRating() {
        return averageRating;
    }

    public int getReviewsCount() {
        return reviewsCount;
    }

    public boolean isTopDriver() {
        return topDriver;
    }
}
