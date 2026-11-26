package com.lms.apigateway;

import com.lms.apigateway.security.JwtUtil;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lms.apigateway.filters.JwtAuthenticationFilter;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import reactor.core.publisher.Mono;
import java.util.concurrent.atomic.AtomicInteger;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class JwtUtilSecurityTests {
    private static final String SECRET = "test-only-jwt-secret-that-is-long-enough-123456";
    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", SECRET);
    }

    @Test
    void acceptsValidHs256Jwt() {
        assertTrue(jwtUtil.validateToken(token(SECRET, new Date(System.currentTimeMillis() + 60_000))));
    }

    @Test
    void rejectsInvalidSignatureExpiredMalformedAndFabricatedTokens() {
        assertFalse(jwtUtil.validateToken(token("different-test-key-that-is-long-enough-123456", new Date(System.currentTimeMillis() + 60_000))));
        assertFalse(jwtUtil.validateToken(token(SECRET, new Date(System.currentTimeMillis() - 60_000))));
        assertFalse(jwtUtil.validateToken("not-a-jwt"));
        String header = Base64.getUrlEncoder().withoutPadding().encodeToString("{\"alg\":\"HS256\",\"typ\":\"JWT\"}".getBytes(StandardCharsets.UTF_8));
        String claims = Base64.getUrlEncoder().withoutPadding().encodeToString("{\"sub\":\"attacker\",\"id\":1,\"role\":\"ADMIN\",\"exp\":4102444800}".getBytes(StandardCharsets.UTF_8));
        assertFalse(jwtUtil.validateToken(header + "." + claims + ".forged-signature"));
    }

    @Test
    void gatewayReturns401ForInvalidTokenAndKeepsExactPublicLoginRoute() {
        JwtUtil validator = mock(JwtUtil.class);
        JwtAuthenticationFilter filter = new JwtAuthenticationFilter(validator, new ObjectMapper());
        MockServerWebExchange protectedExchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/courses").header("Authorization", "Bearer a.b.c").build());
        when(validator.validateToken("a.b.c")).thenReturn(false);
        AtomicInteger calls = new AtomicInteger();
        filter.filter(protectedExchange, exchange -> { calls.incrementAndGet(); return Mono.empty(); }).block();
        assertEquals(HttpStatus.UNAUTHORIZED, protectedExchange.getResponse().getStatusCode());
        assertEquals(0, calls.get());

        MockServerWebExchange loginExchange = MockServerWebExchange.from(MockServerHttpRequest.post("/api/auth/login").build());
        filter.filter(loginExchange, exchange -> { calls.incrementAndGet(); return Mono.empty(); }).block();
        assertEquals(1, calls.get());

        MockServerWebExchange lookalikeExchange = MockServerWebExchange.from(MockServerHttpRequest.post("/api/auth/login-evil").build());
        filter.filter(lookalikeExchange, exchange -> { calls.incrementAndGet(); return Mono.empty(); }).block();
        assertEquals(HttpStatus.UNAUTHORIZED, lookalikeExchange.getResponse().getStatusCode());
        assertEquals(1, calls.get());
    }

    private String token(String key, Date expiration) {
        return Jwts.builder().setSubject("user@example.test").claim("id", 1L).claim("role", "STUDENT")
                .setIssuedAt(new Date()).setExpiration(expiration)
                .signWith(Keys.hmacShaKeyFor(key.getBytes(StandardCharsets.UTF_8)), SignatureAlgorithm.HS256).compact();
    }
}
