package com.lms.quizservice.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

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

    public Claims parse(String token) {
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        Jws<Claims> parsed = Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
        if (!"HS256".equals(parsed.getHeader().getAlgorithm())) throw new JwtException("Unexpected JWT signing algorithm");
        Claims claims = parsed.getPayload();
        if (claims.getSubject() == null || claims.getExpiration() == null || !(claims.get("id") instanceof Number)
                || claims.get("role", String.class) == null) throw new JwtException("Required identity claims are missing");
        return claims;
    }
}
