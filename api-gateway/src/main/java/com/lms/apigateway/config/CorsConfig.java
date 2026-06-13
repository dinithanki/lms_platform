package com.lms.apigateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        
        // Allowed origins: React/Angular dev servers on localhost
        corsConfig.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000", // React default
                "http://localhost:4200", // Angular default
                "http://localhost:5173", // Vite default (React/Vue modern)
                "http://localhost:8080"  // Self / other endpoints
        ));
        
        corsConfig.setMaxAge(3600L); // Cache preflight requests for 1 hour
        
        // Allowed HTTP methods
        corsConfig.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));
        
        // Allowed headers
        corsConfig.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "Accept",
                "X-Requested-With",
                "X-User-Name",
                "X-User-Role"
        ));
        
        corsConfig.setAllowCredentials(true); // Allow sending credentials/cookies

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);

        return new CorsWebFilter(source);
    }
}
