package com.lms.authservice;

import com.lms.authservice.security.JwtUtil;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

class JwtSecretCompatibilityTests {
    private static final String SECRET = "test-only-jwt-secret-that-is-long-enough-123456";

    @Test
    void authTokensUseTheConfiguredHs256KeyAndRejectInvalidTokens() {
        JwtUtil jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", SECRET);
        ReflectionTestUtils.setField(jwtUtil, "expirationTime", 60_000L);
        String token = jwtUtil.generateToken(42L, "student@example.test", "STUDENT");
        assertTrue(jwtUtil.validateToken(token));
        assertEquals(42L, jwtUtil.extractUserId(token));
        assertFalse(jwtUtil.validateToken("a.b.c"));

        String expired = Jwts.builder().subject("student@example.test").claim("id", 42L).claim("role", "STUDENT")
                .issuedAt(new Date(System.currentTimeMillis() - 120_000)).expiration(new Date(System.currentTimeMillis() - 60_000))
                .signWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8)), Jwts.SIG.HS256).compact();
        assertFalse(jwtUtil.validateToken(expired));
    }
}
