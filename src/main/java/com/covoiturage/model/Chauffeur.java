package com.covoiturage.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

public class Chauffeur extends User {
    private static final long serialVersionUID = 1L;
    private List<Trajet> trajetsProposes;
    private List<Vehicule> vehicules;
    private List<Integer> notes;

    public Chauffeur() {
        super();
        this.role = UserRole.CHAUFFEUR;
        this.trajetsProposes = new ArrayList<>();
        this.vehicules = new ArrayList<>();
        this.notes = new ArrayList<>();
    }

    public Chauffeur(String identifiant, String nom, String email, String password) {
        super(identifiant, nom, email, password, UserRole.CHAUFFEUR);
        this.trajetsProposes = new ArrayList<>();
        this.vehicules = new ArrayList<>();
        this.notes = new ArrayList<>();
    }

    public void ajouterTrajet(Trajet t) {
        Objects.requireNonNull(t, "trajet obligatoire");
        this.trajetsProposes.add(t);
    }

    public void ajouterVehicule(Vehicule vehicule) {
        Objects.requireNonNull(vehicule, "vehicule obligatoire");
        this.vehicules.add(vehicule);
    }

    public void ajouterNote(int note) {
        this.notes.add(note);
    }

    public double consulterNotesChauffeur() {
        if (notes.isEmpty()) {
            return 0.0;
        }
        int sum = notes.stream().mapToInt(Integer::intValue).sum();
        return (double) sum / notes.size();
    }

    public List<Trajet> getTrajetsProposes() {
        return Collections.unmodifiableList(new ArrayList<>(trajetsProposes));
    }

    public List<Vehicule> getVehicules() {
        return Collections.unmodifiableList(new ArrayList<>(vehicules));
    }

    @Override
    public String toString() {
        return "Chauffeur{" +
            "id='" + getIdentifiant() + '\'' +
            ", nom='" + getNom() + '\'' +
            ", email='" + getEmail() + '\'' +
            ", note=" + consulterNotesChauffeur() +
            '}';
    }
}