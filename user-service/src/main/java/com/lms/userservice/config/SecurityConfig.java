package com.lms.userservice.config;

import com.lms.userservice.security.JwtAuthenticationFilter;
import com.lms.userservice.security.InternalServiceTokenFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    private InternalServiceTokenFilter internalServiceTokenFilter;

    @Bean
    FilterRegistrationBean<JwtAuthenticationFilter> jwtFilterRegistration() {
        FilterRegistrationBean<JwtAuthenticationFilter> registration = new FilterRegistrationBean<>(jwtAuthenticationFilter);
        registration.setEnabled(false);
        return registration;
    }

    @Bean
    FilterRegistrationBean<InternalServiceTokenFilter> internalFilterRegistration() {
        FilterRegistrationBean<InternalServiceTokenFilter> registration = new FilterRegistrationBean<>(internalServiceTokenFilter);
        registration.setEnabled(false);
        return registration;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http.csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.POST, "/api/users").hasRole("SERVICE")
                        .requestMatchers(HttpMethod.GET, "/api/users/*/profile-picture").permitAll() // Serve profile picture publicly
                        .requestMatchers(HttpMethod.PUT, "/api/users/*/role/sync").hasRole("SERVICE")
                        .requestMatchers("/error").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/users").hasRole("ADMIN") // Get all users
                        .requestMatchers(HttpMethod.DELETE, "/api/users/*").hasRole("ADMIN") // Delete user
                        .requestMatchers(HttpMethod.PUT, "/api/users/*/role").hasRole("ADMIN") // Update user role
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(internalServiceTokenFilter, JwtAuthenticationFilter.class);

        return http.build();
    }
}
