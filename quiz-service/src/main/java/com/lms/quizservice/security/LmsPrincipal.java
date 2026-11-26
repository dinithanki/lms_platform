package com.lms.quizservice.security;

public record LmsPrincipal(Long id, String email, String role) {}
