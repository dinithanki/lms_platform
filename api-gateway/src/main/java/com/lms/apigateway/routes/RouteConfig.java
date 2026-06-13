package com.lms.apigateway.routes;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * RouteConfig is an optional configuration class.
 * Spring Cloud Gateway allows defining routes programmatically in Java
 * as an alternative or supplement to properties/YAML files.
 * 
 * To enable, uncomment the @Configuration and @Bean annotations.
 */
// @Configuration
public class RouteConfig {

    // @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("auth-service-java", r -> r.path("/api/auth/**")
                        .uri("http://localhost:8081"))
                .route("user-service-java", r -> r.path("/api/users/**")
                        .uri("http://localhost:8082"))
                .route("course-service-java", r -> r.path("/api/courses/**")
                        .uri("http://localhost:8083"))
                .route("quiz-service-java", r -> r.path("/api/quizzes/**")
                        .uri("http://localhost:8084"))
                .build();
    }
}
