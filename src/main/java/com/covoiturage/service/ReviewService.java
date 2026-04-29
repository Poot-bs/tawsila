package com.covoiturage.service;

import com.covoiturage.dto.DriverRatingSummary;
import com.covoiturage.dto.ReviewCreateRequest;
import com.covoiturage.exception.NotFoundException;
import com.covoiturage.exception.ValidationException;
import com.covoiturage.model.Chauffeur;
import com.covoiturage.model.ReservationStatus;
import com.covoiturage.model.Review;
import com.covoiturage.repository.ReservationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class ReviewService {
    private final List<Review> reviews = new CopyOnWriteArrayList<>();
    private final ReservationRepository reservationRepository;
    private final AuthService authService;

    public ReviewService(ReservationRepository reservationRepository, AuthService authService) {
        this.reservationRepository = reservationRepository;
        this.authService = authService;
    }

    public Review createReview(ReviewCreateRequest request) {
        validateRequest(request);

        if (reviews.stream().anyMatch(r -> r.getReservationId().equals(request.getReservationId()))) {
            throw new ValidationException("Un avis existe deja pour cette reservation");
        }

        var reservation = reservationRepository.findById(request.getReservationId())
            .orElseThrow(() -> new NotFoundException("Reservation introuvable"));

        if (!reservation.getPassager().getIdentifiant().equals(request.getPassagerId())) {
            throw new ValidationException("Le passager ne correspond pas a la reservation");
        }
        if (!reservation.getTrajet().getChauffeur().getIdentifiant().equals(request.getChauffeurId())) {
            throw new ValidationException("Le chauffeur ne correspond pas a la reservation");
        }
        if (reservation.getReservationStatus() != ReservationStatus.ACCEPTED) {
            throw new ValidationException("Un avis est autorise uniquement pour une reservation acceptee");
        }

        var user = authService.getUtilisateur(request.getChauffeurId());
        if (!(user instanceof Chauffeur chauffeur)) {
            throw new ValidationException("Le chauffeur est invalide");
        }

        Review review = new Review();
        review.setId(UUID.randomUUID().toString());
        review.setReservationId(request.getReservationId());
        review.setPassagerId(request.getPassagerId());
        review.setChauffeurId(request.getChauffeurId());
        review.setStars(request.getStars());
        review.setComment(request.getComment() == null ? "" : request.getComment().trim());
        review.setCreatedAt(LocalDateTime.now());

        reviews.add(review);
        chauffeur.ajouterNote(request.getStars());
        return review;
    }

    public List<Review> getDriverReviews(String chauffeurId) {
        return reviews.stream()
            .filter(r -> r.getChauffeurId().equals(chauffeurId))
            .sorted(Comparator.comparing(Review::getCreatedAt).reversed())
            .toList();
    }

    public DriverRatingSummary getDriverSummary(String chauffeurId) {
        List<Review> items = new ArrayList<>(getDriverReviews(chauffeurId));
        if (items.isEmpty()) {
            return new DriverRatingSummary(chauffeurId, 0.0, 0, false);
        }
        double avg = items.stream().mapToInt(Review::getStars).average().orElse(0.0);
        boolean topDriver = avg >= 4.7 && items.size() >= 3;
        return new DriverRatingSummary(chauffeurId, avg, items.size(), topDriver);
    }

    private void validateRequest(ReviewCreateRequest request) {
        if (request == null || isBlank(request.getReservationId()) || isBlank(request.getPassagerId()) || isBlank(request.getChauffeurId())) {
            throw new ValidationException("reservationId, passagerId et chauffeurId sont obligatoires");
        }
        if (request.getStars() < 1 || request.getStars() > 5) {
            throw new ValidationException("La note doit etre entre 1 et 5");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
