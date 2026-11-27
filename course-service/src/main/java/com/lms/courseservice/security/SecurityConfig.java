package com.lms.courseservice.security;

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
    @Bean
    FilterRegistrationBean<JwtAuthenticationFilter> jwtFilterRegistration(JwtAuthenticationFilter jwtFilter) {
        FilterRegistrationBean<JwtAuthenticationFilter> registration = new FilterRegistrationBean<>(jwtFilter);
        registration.setEnabled(false);
        return registration;
    }

    @Bean
    FilterRegistrationBean<QuizServiceTokenFilter> quizServiceTokenFilterRegistration(QuizServiceTokenFilter filter) {
        FilterRegistrationBean<QuizServiceTokenFilter> registration = new FilterRegistrationBean<>(filter);
        registration.setEnabled(false);
        return registration;
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtFilter,
                                            QuizServiceTokenFilter quizServiceFilter) throws Exception {
        return http.csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/actuator/health", "/actuator/health/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/actuator/prometheus").permitAll()
                        .requestMatchers(HttpMethod.GET, "/internal/courses/*/owner").hasRole("QUIZ_SERVICE")
                        .requestMatchers(HttpMethod.GET, "/courses", "/courses/*", "/courses/*/modules").permitAll()
                        .requestMatchers(HttpMethod.POST, "/courses").hasAnyRole("ADMIN", "INSTRUCTOR")
                        .requestMatchers(HttpMethod.DELETE, "/courses/*").hasAnyRole("ADMIN", "INSTRUCTOR")
                        .requestMatchers(HttpMethod.POST, "/courses/*/modules").hasAnyRole("ADMIN", "INSTRUCTOR")
                        .requestMatchers(HttpMethod.PUT, "/modules/*").hasAnyRole("ADMIN", "INSTRUCTOR")
                        .requestMatchers(HttpMethod.POST, "/courses/*/quiz").hasRole("QUIZ_SERVICE")
                        .anyRequest().authenticated())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(quizServiceFilter, JwtAuthenticationFilter.class)
                .build();
    }
}
