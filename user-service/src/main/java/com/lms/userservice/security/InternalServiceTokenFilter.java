package com.lms.userservice.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Component
public class InternalServiceTokenFilter extends OncePerRequestFilter {
    private static final String HEADER = "X-Auth-Service-Token";

    @Value("${app.auth-service.token:}")
    private String expectedToken;

    @PostConstruct
    void validateConfiguration() {
        if (expectedToken == null || expectedToken.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("LMS_AUTH_SERVICE_TOKEN must contain at least 32 UTF-8 bytes");
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return !(HttpMethod.POST.matches(request.getMethod()) && "/api/users".equals(path)
                || HttpMethod.PUT.matches(request.getMethod()) && path.matches("/api/users/\\d+/role/sync"));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String supplied = request.getHeader(HEADER);
        if (expectedToken == null || expectedToken.isBlank() || supplied == null
                || !MessageDigest.isEqual(expectedToken.getBytes(StandardCharsets.UTF_8), supplied.getBytes(StandardCharsets.UTF_8))) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid service credentials");
            return;
        }

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("auth-service", null, AuthorityUtils.createAuthorityList("ROLE_SERVICE")));
        chain.doFilter(request, response);
    }
}
