package com.covoiturage.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;

import java.nio.charset.StandardCharsets;
import java.io.Serializable;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "identifiant")
public abstract class User implements Serializable {
    private static final long serialVersionUID = 1L;
    private static final int MAX_FAILED_ATTEMPTS = 3;
    protected String identifiant;
    protected UserRole role;
    protected String nom;
    private String email;
    @JsonIgnore
    private String passwordHash;
    private UserStatus status;
    private int tentativesEchouees;
    private List<Notification> notifications;

    protected User() {
        this.notifications = new ArrayList<>();
    }

    protected User(String identifiant, String nom, String email, String password, UserRole role) {
        this.identifiant = identifiant;
        this.nom = nom;
        this.email = email;
        this.passwordHash = hash(password);
        this.status = UserStatus.ACTIVE;
        this.tentativesEchouees = 0;
        this.role = role;
        this.notifications = new ArrayList<>();
    }

    public boolean authentifier(String rawPassword) {
        if (this.status == UserStatus.SUSPENDED || this.status == UserStatus.BLOCKED) {
            return false;
        }
        if (Objects.equals(this.passwordHash, hash(rawPassword))) {
            this.tentativesEchouees = 0;
            return true;
        }
        this.tentativesEchouees++;
        if (this.tentativesEchouees >= MAX_FAILED_ATTEMPTS) {
            bloquerUtilisateur();
        }
        return false;
    }

    public void bloquerUtilisateur() {
        this.status = UserStatus.BLOCKED;
        notifierEmail("Votre compte est bloque apres plusieurs tentatives echouees.");
        notifierSMS("Compte bloque. Contactez le support.");
    }

    public void suspendreCompte() {
        this.status = UserStatus.SUSPENDED;
        notifierEmail("Votre compte est suspendu par un administrateur.");
    }

    public void reactiverCompte() {
        this.status = UserStatus.ACTIVE;
        this.tentativesEchouees = 0;
    }

    protected void notifierEmail(String message) {
        notifications.add(new Notification(UUID.randomUUID().toString(), identifiant, NotificationChannel.EMAIL, message));
    }

    protected void notifierSMS(String message) {
        notifications.add(new Notification(UUID.randomUUID().toString(), identifiant, NotificationChannel.SMS, message));
    }

    public void envoyerNotificationEmail(String message) {
        notifierEmail(message);
    }

    public void envoyerNotificationSMS(String message) {
        notifierSMS(message);
    }

    public void modifierCompte(String nouveauNom, String nouvelEmail) {
        this.nom = Objects.requireNonNull(nouveauNom, "nom obligatoire");
        this.email = Objects.requireNonNull(nouvelEmail, "email obligatoire");
    }

    public void changerMotDePasse(String nouveauMotDePasse) {
        this.passwordHash = hash(nouveauMotDePasse);
    }

    public String getIdentifiant() {
        return identifiant;
    }

    public String getNom() {
        return nom;
    }

    public String getEmail() {
        return email;
    }

    public UserRole getRole() {
        return role;
    }

    public UserStatus getStatus() {
        return status;
    }

    public int getTentativesEchouees() {
        return tentativesEchouees;
    }

    public List<Notification> getNotifications() {
        return Collections.unmodifiableList(new ArrayList<>(notifications));
    }

    private String hash(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hashed) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Hash algorithm unavailable", e);
        }
    }

    @Override
    public String toString() {
        return "User{" +
            "identifiant='" + identifiant + '\'' +
            ", nom='" + nom + '\'' +
            ", email='" + email + '\'' +
            ", role=" + role +
            ", status=" + status +
            '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof User user)) {
            return false;
        }
        return Objects.equals(identifiant, user.identifiant);
    }

    @Override
    public int hashCode() {
        return Objects.hash(identifiant);
    }
}