package com.covoiturage.repository.postgres;

import com.covoiturage.model.Reservation;
import com.covoiturage.repository.ReservationRepository;
import com.covoiturage.repository.serialization.JavaSerializationUtils;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
@ConditionalOnProperty(name = "app.persistence.mode", havingValue = "postgres")
public class PostgresReservationRepository implements ReservationRepository {
    private final PostgresConnectionProvider provider;

    public PostgresReservationRepository(PostgresConnectionProvider provider) {
        this.provider = provider;
    }

    @Override
    public Reservation save(Reservation reservation) {
        String sql = "insert into " + provider.table("reservations_store")
            + "(id, trajet_id, passager_id, payload) values (?, ?, ?, ?) "
            + "on conflict (id) do update set trajet_id = excluded.trajet_id, passager_id = excluded.passager_id, payload = excluded.payload, updated_at = now()";

        try (Connection conn = provider.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, reservation.getId());
            ps.setString(2, reservation.getTrajet().getId());
            ps.setString(3, reservation.getPassager().getIdentifiant());
            ps.setString(4, JavaSerializationUtils.toBase64(reservation));
            ps.executeUpdate();
            return reservation;
        } catch (Exception ex) {
            throw new IllegalStateException("Erreur Postgres save reservation", ex);
        }
    }

    @Override
    public Optional<Reservation> findById(String id) {
        String sql = "select payload from " + provider.table("reservations_store") + " where id = ? limit 1";
        try (Connection conn = provider.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) {
                    return Optional.empty();
                }
                return Optional.of(JavaSerializationUtils.fromBase64(rs.getString("payload"), Reservation.class));
            }
        } catch (Exception ex) {
            throw new IllegalStateException("Erreur Postgres find reservation by id", ex);
        }
    }

    @Override
    public List<Reservation> findAll() {
        return findByFilter(null, null);
    }

    @Override
    public List<Reservation> findByTrajetId(String trajetId) {
        return findByFilter("trajet_id", trajetId);
    }

    @Override
    public List<Reservation> findByPassagerId(String passagerId) {
        return findByFilter("passager_id", passagerId);
    }

    private List<Reservation> findByFilter(String column, String value) {
        String sql = "select payload from " + provider.table("reservations_store");
        boolean hasFilter = column != null && value != null;
        if (hasFilter) {
            sql += " where " + column + " = ?";
        }

        try (Connection conn = provider.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            if (hasFilter) {
                ps.setString(1, value);
            }
            try (ResultSet rs = ps.executeQuery()) {
                List<Reservation> reservations = new ArrayList<>();
                while (rs.next()) {
                    reservations.add(JavaSerializationUtils.fromBase64(rs.getString("payload"), Reservation.class));
                }
                return reservations;
            }
        } catch (Exception ex) {
            throw new IllegalStateException("Erreur Postgres find reservations", ex);
        }
    }
}
