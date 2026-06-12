package com.lms.authservice.service;

import com.lms.authservice.dto.request.LoginRequestDTO;
import com.lms.authservice.dto.request.RegisterRequestDTO;
import com.lms.authservice.dto.response.AuthResponseDTO;
import com.lms.authservice.dto.response.UserResponseDTO;
import com.lms.authservice.dto.response.ValidateTokenResponseDTO;

import java.util.List;

public interface AuthService {

    AuthResponseDTO register(RegisterRequestDTO request);

    AuthResponseDTO login(LoginRequestDTO request);

    ValidateTokenResponseDTO validateToken(String token);

    UserResponseDTO updateUserRole(Long userId, String role);

    List<UserResponseDTO> getAllUsers();

    UserResponseDTO getCurrentUser(String email);
}