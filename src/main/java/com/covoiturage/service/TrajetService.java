package com.covoiturage.service;

import com.covoiturage.dto.TrajetCreateRequest;
import com.covoiturage.exception.InvalidStateException;
import com.covoiturage.exception.NotFoundException;
import com.covoiturage.exception.ValidationException;
import com.covoiturage.model.Chauffeur;
import com.covoiturage.model.Trajet;
import com.covoiturage.model.TripStatus;
import com.covoiturage.model.User;
import com.covoiturage.model.UserRole;
import com.covoiturage.model.Vehicule;
import com.covoiturage.repository.TrajetRepository;
import com.covoiturage.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class TrajetService {
    private final TrajetRepository trajetRepository;
    private final AuthService authService;
    private final UserRepository userRepository;

    public TrajetService(TrajetRepository trajetRepository, AuthService authService, UserRepository userRepository) {
        this.trajetRepository = trajetRepository;
        this.authService = authService;
        this.userRepository = userRepository;
    }

    public Trajet proposerTrajet(TrajetCreateRequest request) {
        if (request == null) {
            throw new ValidationException("Request invalide");
        }
        if (isBlank(request.getChauffeurId()) || isBlank(request.getVehiculeId()) || isBlank(request.getDepart()) || isBlank(request.getArrivee())) {
            throw new ValidationException("chauffeurId, vehiculeId, depart et arrivee sont obligatoires");
        }
        if (request.getDateDepart() == null || !request.getDateDepart().isAfter(LocalDateTime.now())) {
            throw new ValidationException("dateDepart doit etre dans le futur");
        }
        if (request.getPlacesMax() <= 0) {
            throw new ValidationException("placesMax doit etre superieur a 0");
        }
        if (request.getPrixParPlace() <= 0) {
            throw new ValidationException("prixParPlace doit etre superieur a 0");
        }

        User user = authService.getUtilisateur(request.getChauffeurId());
        if (user.getRole() != UserRole.CHAUFFEUR || !(user instanceof Chauffeur)) {
            throw new ValidationException("Seul un chauffeur peut proposer un trajet");
        }
        Chauffeur chauffeur = (Chauffeur) user;

        Vehicule vehicule = chauffeur.getVehicules().stream()
            .filter(v -> v.getId().equals(request.getVehiculeId()))
            .findFirst()
            .orElseThrow(() -> new NotFoundException("Vehicule introuvable pour ce chauffeur"));

        Trajet trajet = new Trajet(
            UUID.randomUUID().toString(),
            chauffeur,
            vehicule,
            request.getDepart().trim(),
            request.getArrivee().trim(),
            request.getDateDepart(),
            request.getPlacesMax(),
            request.getPrixParPlace()
        );
        chauffeur.ajouterTrajet(trajet);
        userRepository.save(chauffeur);
        return trajetRepository.save(trajet);
    }

    public Trajet cloreTrajet(String trajetId) {
        Trajet trajet = getTrajet(trajetId);
        trajet.cloreTrajet();
        return trajetRepository.save(trajet);
    }

    public List<Trajet> getTrajets(String depart, String arrivee, LocalDateTime dateMin, LocalDateTime dateMax, Double prixMax) {
        return trajetRepository.findAll().stream()
            .filter(t -> t.getEtat() == TripStatus.OPEN)
            .filter(t -> t.getPlacesDisponibles() > 0)
            .filter(t -> isBlank(depart) || t.getDepart().equalsIgnoreCase(depart.trim()))
            .filter(t -> isBlank(arrivee) || t.getArrivee().equalsIgnoreCase(arrivee.trim()))
            .filter(t -> dateMin == null || !t.getDateDepart().isBefore(dateMin))
            .filter(t -> dateMax == null || !t.getDateDepart().isAfter(dateMax))
            .filter(t -> prixMax == null || t.getPrixParPlace() <= prixMax)
            .toList();
    }

    public List<Trajet> getTousTrajets() {
        return trajetRepository.findAll();
    }

    public Trajet annulerTrajetParChauffeur(String trajetId, LocalDateTime now) {
        Trajet trajet = getTrajet(trajetId);
        if (!trajet.chauffeurPeutAnnuler()) {
            throw new InvalidStateException("Le chauffeur ne peut pas annuler un trajet avec des reservations");
        }
        trajet.annulerTrajet();
        return trajetRepository.save(trajet);
    }

    public Trajet getTrajet(String trajetId) {
        return trajetRepository.findById(trajetId).orElseThrow(() -> new NotFoundException("Trajet introuvable"));
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
