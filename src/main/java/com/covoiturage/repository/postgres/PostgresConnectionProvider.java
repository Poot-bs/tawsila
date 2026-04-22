package com.covoiturage.repository.postgres;

import com.covoiturage.exception.ValidationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

@Component
@ConditionalOnProperty(name = "app.persistence.mode", havingValue = "postgres")
public class PostgresConnectionProvider {
    private final String url;
    private final String user;
    private final String password;
    private final String schema;

    public PostgresConnectionProvider(@Value("${postgres.url:}") String url,
                                      @Value("${postgres.user:}") String user,
                                      @Value("${postgres.password:}") String password,
                                      @Value("${postgres.schema:public}") String schema) {
        if (isBlank(url) || isBlank(user) || isBlank(password)) {
            throw new ValidationException("POSTGRES_URL, POSTGRES_USER et POSTGRES_PASSWORD sont obligatoires en mode postgres");
        }
        this.url = url;
        this.user = user;
        this.password = password;
        this.schema = isBlank(schema) ? "public" : schema.trim();
    }

    public Connection getConnection() throws SQLException {
        return DriverManager.getConnection(url, user, password);
    }

    public String table(String tableName) {
        return schema + "." + tableName;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
