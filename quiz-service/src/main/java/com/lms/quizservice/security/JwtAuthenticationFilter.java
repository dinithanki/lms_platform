package com.lms.quizservice.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    @Autowired private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String token = bearerToken(request);
        String requestPath = request.getRequestURI().substring(request.getContextPath().length());
        boolean publicHealth = requestPath.equals("/actuator/health")
                || requestPath.startsWith("/actuator/health/");
        if (token == null && publicHealth) {
            chain.doFilter(request, response);
            return;
        }
        if (token == null) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Authentication is required");
            return;
        }
        LmsPrincipal principal;
        try {
            Claims claims = jwtUtil.parse(token);
            Object idClaim = claims.get("id");
            if (!(idClaim instanceof Number rawId)) throw new JwtException("Invalid user id claim");
            String role = claims.get("role", String.class).replace("ROLE_", "").toUpperCase();
            if (rawId.longValue() <= 0 || !("ADMIN".equals(role) || "STUDENT".equals(role) || "INSTRUCTOR".equals(role)))
                throw new JwtException("Invalid identity claims");
            principal = new LmsPrincipal(rawId.longValue(), claims.getSubject(), role);
        } catch (JwtException | IllegalArgumentException ex) {
            SecurityContextHolder.clearContext();
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired JWT token");
            return;
        }
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                principal, null, List.of(new SimpleGrantedAuthority("ROLE_" + principal.role()))));
        chain.doFilter(request, response);
    }

    private String bearerToken(HttpServletRequest request) {
        String authorization = request.getHeader("Authorization");
        if (authorization != null && authorization.startsWith("Bearer ")) return authorization.substring(7);
        if (request.getCookies() != null) for (Cookie cookie : request.getCookies())
            if ("jwt".equals(cookie.getName())) return cookie.getValue();
        return null;
    }
}
