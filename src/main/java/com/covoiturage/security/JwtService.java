package com.covoiturage.security;

import com.covoiturage.exception.ValidationException;
import com.covoiturage.model.User;
import com.covoiturage.model.UserRole;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;

@Service
public class JwtService {
    private final byte[] secret;

    public JwtService(@Value("${app.jwt.secret:tawsila-dev-secret-change-me}") String secret) {
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
    }

    public String generateToken(User user, long ttlSeconds) {
        long exp = Instant.now().getEpochSecond() + ttlSeconds;
        String header = base64Url("JWTv1");
        String payload = base64Url(user.getIdentifiant() + ":" + user.getRole().name() + ":" + exp);
        String signature = sign(header + "." + payload);
        return header + "." + payload + "." + signature;
    }

    public Map<String, String> parseAndValidate(String token) {
        if (token == null || token.isBlank()) {
            throw new ValidationException("Token manquant");
        }
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw new ValidationException("Token invalide");
        }
        String expected = sign(parts[0] + "." + parts[1]);
        if (!expected.equals(parts[2])) {
            throw new ValidationException("Signature token invalide");
        }

        String payload = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
        String[] items = payload.split(":");
        if (items.length != 3) {
            throw new ValidationException("Payload token invalide");
        }
        long exp = Long.parseLong(items[2]);
        if (Instant.now().getEpochSecond() > exp) {
            throw new ValidationException("Token expire");
        }
        UserRole.valueOf(items[1]);
        return Map.of("userId", items[0], "role", items[1], "exp", String.valueOf(exp));
    }

    private String sign(String content) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA256");
            hmac.init(new SecretKeySpec(secret, "HmacSHA256"));
            byte[] digest = hmac.doFinal(content.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
        } catch (Exception e) {
            throw new IllegalStateException("Impossible de signer le token", e);
        }
    }

    private String base64Url(String value) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }
}
