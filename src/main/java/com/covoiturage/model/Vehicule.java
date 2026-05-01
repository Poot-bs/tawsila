package com.covoiturage.model;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;

import java.io.Serializable;
import java.util.Objects;

@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class Vehicule implements Serializable {
    private static final long serialVersionUID = 1L;
    private String id;
    private String marque;
    private String modele;
    private String immatriculation;
    private int capacite;

    public Vehicule() {
    }

    public Vehicule(String id, String marque, String modele, String immatriculation, int capacite) {
        this.id = id;
        this.marque = marque;
        this.modele = modele;
        this.immatriculation = immatriculation;
        this.capacite = capacite;
    }

    public String getId() {
        return id;
    }

    public String getMarque() {
        return marque;
    }

    public String getModele() {
        return modele;
    }

    public String getImmatriculation() {
        return immatriculation;
    }

    public int getCapacite() {
        return capacite;
    }

    @Override
    public String toString() {
        return "Vehicule{" +
            "id='" + id + '\'' +
            ", marque='" + marque + '\'' +
            ", modele='" + modele + '\'' +
            ", immatriculation='" + immatriculation + '\'' +
            ", capacite=" + capacite +
            '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Vehicule vehicule)) {
            return false;
        }
        return Objects.equals(id, vehicule.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
