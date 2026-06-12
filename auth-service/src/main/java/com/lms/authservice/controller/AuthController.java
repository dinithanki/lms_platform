package com.lms.authservice.controller;

import com.lms.authservice.dto.request.LoginRequestDTO;
import com.lms.authservice.dto.request.RegisterRequestDTO;
import com.lms.authservice.dto.response.AuthResponseDTO;
import com.lms.authservice.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public AuthResponseDTO register(@RequestBody RegisterRequestDTO request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponseDTO login(@RequestBody LoginRequestDTO request) {
        return authService.login(request);
    }
}