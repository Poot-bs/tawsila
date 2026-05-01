package com.covoiturage.service;

import com.covoiturage.dto.MoyenPaiementCreateRequest;
import com.covoiturage.dto.VehiculeCreateRequest;
import com.covoiturage.exception.ValidationException;
import com.covoiturage.model.Chauffeur;
import com.covoiturage.model.MoyenPaiement;
import com.covoiturage.model.Passager;
import com.covoiturage.model.User;
import com.covoiturage.model.Vehicule;
import com.covoiturage.model.UserRole;
import com.covoiturage.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class UserDataService {
    private final AuthService authService;
    private final UserRepository userRepository;

    public UserDataService(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    public Vehicule addVehicule(VehiculeCreateRequest request) {
        if (request == null || isBlank(request.getChauffeurId())) {
            throw new ValidationException("chauffeurId obligatoire");
        }
        User user = authService.getUtilisateur(request.getChauffeurId());
        if (user.getRole() != UserRole.CHAUFFEUR || !(user instanceof Chauffeur)) {
            throw new ValidationException("L'utilisateur " + request.getChauffeurId() + " n'est pas enregistre en tant que chauffeur. Role actuel: " + user.getRole());
        }
        Chauffeur chauffeur = (Chauffeur) user;
        Vehicule vehicule = new Vehicule(
            UUID.randomUUID().toString(),
            request.getMarque(),
            request.getModele(),
            request.getImmatriculation(),
            request.getCapacite()
        );
        chauffeur.ajouterVehicule(vehicule);
        // persist changes to the chauffeur so vehicle is stored in DB-backed repositories
        userRepository.save(chauffeur);
        return vehicule;
    }

    public List<Vehicule> getVehicules(String chauffeurId) {
        User user = authService.getUtilisateur(chauffeurId);
        if (user.getRole() != UserRole.CHAUFFEUR || !(user instanceof Chauffeur)) {
            throw new ValidationException("Utilisateur non chauffeur");
        }
        return ((Chauffeur) user).getVehicules();
    }

    public MoyenPaiement addMoyenPaiement(MoyenPaiementCreateRequest request) {
        User user = authService.getUtilisateur(request.getPassagerId());
        if (!(user instanceof Passager passager)) {
            throw new ValidationException("Seul un passager peut ajouter un moyen de paiement");
        }
        MoyenPaiement moyenPaiement = new MoyenPaiement(
            UUID.randomUUID().toString(),
            request.getHolderName(),
            request.getType(),
            request.getCardLast4()
        );
        passager.ajouterMoyenPaiement(moyenPaiement);
        userRepository.save(passager);
        return moyenPaiement;
    }

    public List<MoyenPaiement> getMoyensPaiement(String passagerId) {
        User user = authService.getUtilisateur(passagerId);
        if (!(user instanceof Passager passager)) {
            throw new ValidationException("Utilisateur non passager");
        }
        return passager.getMoyensPaiement();
    }

    public double consulterNotesChauffeur(String chauffeurId) {
        User user = authService.getUtilisateur(chauffeurId);
        if (!(user instanceof Chauffeur chauffeur)) {
            throw new ValidationException("Utilisateur non chauffeur");
        }
        return chauffeur.consulterNotesChauffeur();
    }

    public void evaluerChauffeur(String passagerId, String chauffeurId, int note) {
        User passagerUser = authService.getUtilisateur(passagerId);
        User chauffeurUser = authService.getUtilisateur(chauffeurId);
        if (passagerUser.getRole() != UserRole.PASSAGER || chauffeurUser.getRole() != UserRole.CHAUFFEUR) {
            throw new ValidationException("Evaluation invalide");
        }
        Passager passager = (Passager) passagerUser;
        Chauffeur chauffeur = (Chauffeur) chauffeurUser;
        try {
            passager.evaluerChauffeur(chauffeur, note);
        } catch (IllegalArgumentException ex) {
            throw new ValidationException(ex.getMessage());
        }
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
