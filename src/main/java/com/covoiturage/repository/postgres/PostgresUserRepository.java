package com.covoiturage.repository.postgres;

import com.covoiturage.model.User;
import com.covoiturage.repository.UserRepository;
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
public class PostgresUserRepository implements UserRepository {
    private final PostgresConnectionProvider provider;

    public PostgresUserRepository(PostgresConnectionProvider provider) {
        this.provider = provider;
    }

    @Override
    public User save(User user) {
        String sql = "insert into " + provider.table("users_store")
            + "(id, email, payload) values (?, ?, ?) "
            + "on conflict (id) do update set email = excluded.email, payload = excluded.payload, updated_at = now()";

        try (Connection conn = provider.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, user.getIdentifiant());
            ps.setString(2, user.getEmail());
            ps.setString(3, JavaSerializationUtils.toBase64(user));
            ps.executeUpdate();
            return user;
        } catch (Exception ex) {
            throw new IllegalStateException("Erreur Postgres save user", ex);
        }
    }

    @Override
    public Optional<User> findById(String id) {
        String sql = "select payload from " + provider.table("users_store") + " where id = ? limit 1";
        try (Connection conn = provider.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) {
                    return Optional.empty();
                }
                return Optional.of(JavaSerializationUtils.fromBase64(rs.getString("payload"), User.class));
            }
        } catch (Exception ex) {
            throw new IllegalStateException("Erreur Postgres find user by id", ex);
        }
    }

    @Override
    public Optional<User> findByEmail(String email) {
        String sql = "select payload from " + provider.table("users_store") + " where email = ? limit 1";
        try (Connection conn = provider.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, email);
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) {
                    return Optional.empty();
                }
                return Optional.of(JavaSerializationUtils.fromBase64(rs.getString("payload"), User.class));
            }
        } catch (Exception ex) {
            throw new IllegalStateException("Erreur Postgres find user by email", ex);
        }
    }

    @Override
    public List<User> findAll() {
        String sql = "select payload from " + provider.table("users_store");
        try (Connection conn = provider.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            List<User> users = new ArrayList<>();
            while (rs.next()) {
                users.add(JavaSerializationUtils.fromBase64(rs.getString("payload"), User.class));
            }
            return users;
        } catch (Exception ex) {
            throw new IllegalStateException("Erreur Postgres find all users", ex);
        }
    }
}
