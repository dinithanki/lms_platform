package com.lms.courseservice.security;

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
public class QuizServiceTokenFilter extends OncePerRequestFilter {
    @Value("${app.quiz-service.token:}")
    private String expectedToken;

    @PostConstruct
    void validateConfiguration() {
        if (expectedToken == null || expectedToken.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("LMS_QUIZ_SERVICE_TOKEN must contain at least 32 UTF-8 bytes");
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        boolean scoreWrite = HttpMethod.POST.matches(request.getMethod())
                && path.matches("/courses/\\d+/quiz");
        boolean courseOwnerRead = HttpMethod.GET.matches(request.getMethod())
                && path.matches("/internal/courses/\\d+/owner");
        return !scoreWrite && !courseOwnerRead;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String supplied = request.getHeader("X-Quiz-Service-Token");
        if (expectedToken == null || expectedToken.isBlank() || supplied == null
                || !MessageDigest.isEqual(expectedToken.getBytes(StandardCharsets.UTF_8), supplied.getBytes(StandardCharsets.UTF_8))) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid service credentials");
            return;
        }
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                "quiz-service", null, AuthorityUtils.createAuthorityList("ROLE_QUIZ_SERVICE")));
        chain.doFilter(request, response);
    }
}
