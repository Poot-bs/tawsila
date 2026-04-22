package com.covoiturage.repository.postgres;

import com.covoiturage.model.Trajet;
import com.covoiturage.repository.TrajetRepository;
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
public class PostgresTrajetRepository implements TrajetRepository {
    private final PostgresConnectionProvider provider;

    public PostgresTrajetRepository(PostgresConnectionProvider provider) {
        this.provider = provider;
    }

    @Override
    public Trajet save(Trajet trajet) {
        String sql = "insert into " + provider.table("trajets_store")
            + "(id, payload) values (?, ?) "
            + "on conflict (id) do update set payload = excluded.payload, updated_at = now()";

        try (Connection conn = provider.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, trajet.getId());
            ps.setString(2, JavaSerializationUtils.toBase64(trajet));
            ps.executeUpdate();
            return trajet;
        } catch (Exception ex) {
            throw new IllegalStateException("Erreur Postgres save trajet", ex);
        }
    }

    @Override
    public Optional<Trajet> findById(String id) {
        String sql = "select payload from " + provider.table("trajets_store") + " where id = ? limit 1";
        try (Connection conn = provider.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) {
                    return Optional.empty();
                }
                return Optional.of(JavaSerializationUtils.fromBase64(rs.getString("payload"), Trajet.class));
            }
        } catch (Exception ex) {
            throw new IllegalStateException("Erreur Postgres find trajet by id", ex);
        }
    }

    @Override
    public List<Trajet> findAll() {
        String sql = "select payload from " + provider.table("trajets_store");
        try (Connection conn = provider.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            List<Trajet> trajets = new ArrayList<>();
            while (rs.next()) {
                trajets.add(JavaSerializationUtils.fromBase64(rs.getString("payload"), Trajet.class));
            }
            return trajets;
        } catch (Exception ex) {
            throw new IllegalStateException("Erreur Postgres find all trajets", ex);
        }
    }
}
