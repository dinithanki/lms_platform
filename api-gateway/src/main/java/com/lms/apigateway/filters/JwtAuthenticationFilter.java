package com.lms.apigateway.filters;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lms.apigateway.model.ApiResponse;
import com.lms.apigateway.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper;

    // List of public endpoints that bypass authentication checking
    private static final List<String> PUBLIC_ENDPOINTS = List.of(
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/token/refresh",
            "/api/auth/validate"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getPath().value();

        // 1. Skip validation for public endpoints
        if (isPublicEndpoint(path)) {
            log.debug("Bypassing authentication for public path: {}", path);
            return chain.filter(exchange);
        }

        // 2. Extract Authorization Header
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("Missing or invalid Authorization header for secure route: {}", path);
            return handleUnauthorized(exchange, "Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);

        // 3. Validate Token
        if (!jwtUtil.validateToken(token)) {
            log.warn("Token validation failed for path: {}", path);
            return handleUnauthorized(exchange, "Invalid or expired JWT token");
        }

        // 4. Extract User Details
        String role = jwtUtil.extractRole(token);
        String username = jwtUtil.extractUsername(token);
        log.debug("Authenticated user: {} with role: {} for route: {}", username, role, path);

        // 5. Basic RBAC (Role-based access control check)
        // If route requires admin, verify role is ADMIN
        if (path.contains("/admin/") && !"ADMIN".equalsIgnoreCase(role)) {
            log.warn("Access denied. User {} with role {} tried to access admin route: {}", username, role, path);
            return handleForbidden(exchange, "Access denied. Admin privileges required");
        }

        // 6. Propagate identity to downstream microservices via request headers
        ServerHttpRequest mutatedRequest = request.mutate()
                .header("X-User-Name", username)
                .header("X-User-Role", role)
                .build();

        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    private boolean isPublicEndpoint(String path) {
        return PUBLIC_ENDPOINTS.stream().anyMatch(path::startsWith);
    }

    private Mono<Void> handleUnauthorized(ServerWebExchange exchange, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        ApiResponse<Object> apiResponse = ApiResponse.error(message);

        try {
            byte[] bytes = objectMapper.writeValueAsBytes(apiResponse);
            DataBuffer buffer = response.bufferFactory().wrap(bytes);
            return response.writeWith(Mono.just(buffer));
        } catch (JsonProcessingException e) {
            log.error("Failed to write unauthorized response JSON", e);
            return response.setComplete();
        }
    }

    private Mono<Void> handleForbidden(ServerWebExchange exchange, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.FORBIDDEN);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        ApiResponse<Object> apiResponse = ApiResponse.error(message);

        try {
            byte[] bytes = objectMapper.writeValueAsBytes(apiResponse);
            DataBuffer buffer = response.bufferFactory().wrap(bytes);
            return response.writeWith(Mono.just(buffer));
        } catch (JsonProcessingException e) {
            log.error("Failed to write forbidden response JSON", e);
            return response.setComplete();
        }
    }

    @Override
    public int getOrder() {
        // Run immediately after the logging filter
        return Ordered.HIGHEST_PRECEDENCE + 1;
    }
}
