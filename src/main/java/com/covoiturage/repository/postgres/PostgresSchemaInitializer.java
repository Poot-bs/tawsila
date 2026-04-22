package com.covoiturage.repository.postgres;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.Statement;

@Component
@ConditionalOnProperty(name = "app.persistence.mode", havingValue = "postgres")
public class PostgresSchemaInitializer {

    public PostgresSchemaInitializer(PostgresConnectionProvider provider) {
        try (Connection conn = provider.getConnection();
             Statement st = conn.createStatement()) {

            st.execute("create table if not exists " + provider.table("users_store") + " ("
                + "id text primary key,"
                + "email text unique not null,"
                + "payload text not null,"
                + "updated_at timestamptz not null default now()"
                + ")");

            st.execute("create table if not exists " + provider.table("trajets_store") + " ("
                + "id text primary key,"
                + "payload text not null,"
                + "updated_at timestamptz not null default now()"
                + ")");

            st.execute("create table if not exists " + provider.table("reservations_store") + " ("
                + "id text primary key,"
                + "trajet_id text not null,"
                + "passager_id text not null,"
                + "payload text not null,"
                + "updated_at timestamptz not null default now()"
                + ")");

            st.execute("create index if not exists idx_reservations_store_trajet_id on "
                + provider.table("reservations_store") + "(trajet_id)");
            st.execute("create index if not exists idx_reservations_store_passager_id on "
                + provider.table("reservations_store") + "(passager_id)");

        } catch (Exception ex) {
            throw new IllegalStateException("Impossible d'initialiser le schema Postgres", ex);
        }
    }
}
