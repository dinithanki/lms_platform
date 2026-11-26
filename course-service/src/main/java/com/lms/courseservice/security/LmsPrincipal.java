package com.lms.courseservice.security;

public record LmsPrincipal(Long id, String email, String role) {}
