package com.covoiturage.dto;

public class ReviewCreateRequest {
    private String reservationId;
    private String passagerId;
    private String chauffeurId;
    private int stars;
    private String comment;

    public String getReservationId() {
        return reservationId;
    }

    public void setReservationId(String reservationId) {
        this.reservationId = reservationId;
    }

    public String getPassagerId() {
        return passagerId;
    }

    public void setPassagerId(String passagerId) {
        this.passagerId = passagerId;
    }

    public String getChauffeurId() {
        return chauffeurId;
    }

    public void setChauffeurId(String chauffeurId) {
        this.chauffeurId = chauffeurId;
    }

    public int getStars() {
        return stars;
    }

    public void setStars(int stars) {
        this.stars = stars;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}
