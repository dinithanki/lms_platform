package com.lms.apigateway.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import io.jsonwebtoken.JwtException;

@Component
public class JwtUtil {

    @Value("${jwt.secret:}")
    private String secret;

    @PostConstruct
    void validateConfiguration() {
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("LMS_JWT_SECRET must contain at least 32 UTF-8 bytes");
        }
    }

    public boolean validateToken(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }
        try {
            Jws<Claims> parsed = parseToken(token);
            Claims claims = parsed.getBody();
            Object id = claims.get("id");
            String role = claims.get("role", String.class);
            return "HS256".equals(parsed.getHeader().getAlgorithm())
                    && claims.getSubject() != null
                    && claims.getExpiration() != null
                    && id instanceof Number number && number.longValue() > 0
                    && ("ADMIN".equalsIgnoreCase(role) || "STUDENT".equalsIgnoreCase(role)
                    || "INSTRUCTOR".equalsIgnoreCase(role));
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String extractRole(String token) {
        Claims claims = extractAllClaims(token);
        String role = claims.get("role", String.class);
        return role == null ? "STUDENT" : role.replace("ROLE_", "");
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    public Long extractUserId(String token) {
        Object id = extractAllClaims(token).get("id");
        return id instanceof Number number ? number.longValue() : null;
    }

    private Claims extractAllClaims(String token) {
        return parseToken(token).getBody();
    }

    private Jws<Claims> parseToken(String token) {
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token);
    }
}
