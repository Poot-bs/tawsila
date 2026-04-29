package com.covoiturage.service;

import com.covoiturage.dto.LoginRequest;
import com.covoiturage.dto.RegisterRequest;
import com.covoiturage.exception.NotFoundException;
import com.covoiturage.exception.UserBlockedException;
import com.covoiturage.exception.ValidationException;
import com.covoiturage.model.Admin;
import com.covoiturage.model.Chauffeur;
import com.covoiturage.model.Passager;
import com.covoiturage.model.User;
import com.covoiturage.model.UserStatus;
import com.covoiturage.repository.UserRepository;
import com.covoiturage.security.JwtService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final Map<String, String> sessionsByToken;

    public AuthService(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.sessionsByToken = new ConcurrentHashMap<>();
    }

    public User creerCompte(RegisterRequest request) {
        if (request == null) {
            throw new ValidationException("Request invalide");
        }
        if (isBlank(request.getEmail()) || isBlank(request.getPassword()) || isBlank(request.getRole()) || isBlank(request.getNom())) {
            throw new ValidationException("nom, email, password et role sont obligatoires");
        }
        String email = request.getEmail().trim();
        String nom = request.getNom().trim();
        String password = request.getPassword().trim();

        if (userRepository.findByEmail(email).isPresent()) {
            throw new ValidationException("Un compte avec cet email existe deja");
        }

        String id = UUID.randomUUID().toString();
        String role = request.getRole().trim().toUpperCase();
        User user;
        switch (role) {
            case "PASSAGER" -> user = new Passager(id, nom, email, password);
            case "CHAUFFEUR" -> user = new Chauffeur(id, nom, email, password);
            case "ADMIN" -> user = new Admin(id, nom, email, password);
            default -> throw new ValidationException("Role invalide. Utilisez PASSAGER, CHAUFFEUR ou ADMIN");
        }
        return userRepository.save(user);
    }

    public String authentifier(LoginRequest request) {
        if (request == null || isBlank(request.getEmail()) || isBlank(request.getPassword())) {
            throw new ValidationException("email et password sont obligatoires");
        }
        User user = userRepository.findByEmail(request.getEmail().trim())
            .orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));

        if (user.getStatus() == UserStatus.BLOCKED || user.getStatus() == UserStatus.SUSPENDED) {
            throw new UserBlockedException("Utilisateur bloque ou suspendu");
        }
        boolean ok = user.authentifier(request.getPassword().trim());
        if (!ok) {
            throw new ValidationException("Identifiants invalides");
        }
        String token = jwtService.generateToken(user, 86400);
        sessionsByToken.put(token, user.getIdentifiant());
        return token;
    }

    public void deconnecter(String token) {
        sessionsByToken.remove(token);
    }

    public User modifierCompte(String userId, String nom, String email) {
        User user = getUtilisateur(userId);
        user.modifierCompte(nom, email);
        return userRepository.save(user);
    }

    public User suspendreCompte(String userId) {
        User user = getUtilisateur(userId);
        user.suspendreCompte();
        return userRepository.save(user);
    }

    public User bloquerUtilisateur(String userId) {
        User user = getUtilisateur(userId);
        user.bloquerUtilisateur();
        return userRepository.save(user);
    }

    public List<User> getUsers() {
        return userRepository.findAll();
    }

    public User getUtilisateur(String userId) {
        return userRepository.findById(userId).orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));
    }

    public Optional<User> getByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User getUtilisateurParToken(String token) {
        if (isBlank(token)) {
            throw new ValidationException("Token manquant");
        }
        String userId = sessionsByToken.get(token.trim());
        if (userId == null) {
            throw new NotFoundException("Session introuvable");
        }
        return getUtilisateur(userId);
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}