package com.lms.userservice;

import com.lms.userservice.security.JwtUtil;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

class JwtSecretCompatibilityTests {
    private static final String SECRET = "test-only-jwt-secret-that-is-long-enough-123456";

    @Test
    void verifiesAuthStyleHs256TokensAndRejectsInvalidTokens() {
        JwtUtil jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", SECRET);
        String valid = Jwts.builder().subject("student@example.test").claim("id", 42L).claim("role", "STUDENT")
                .issuedAt(new Date()).expiration(new Date(System.currentTimeMillis() + 60_000))
                .signWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8)), Jwts.SIG.HS256).compact();
        assertEquals("student@example.test", jwtUtil.extractEmail(valid));
        assertFalse(jwtUtil.validateToken("header.payload.signature"));

        String expired = Jwts.builder().subject("student@example.test").claim("id", 42L).claim("role", "STUDENT")
                .issuedAt(new Date(System.currentTimeMillis() - 120_000)).expiration(new Date(System.currentTimeMillis() - 60_000))
                .signWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8)), Jwts.SIG.HS256).compact();
        assertFalse(jwtUtil.validateToken(expired));
    }
}
