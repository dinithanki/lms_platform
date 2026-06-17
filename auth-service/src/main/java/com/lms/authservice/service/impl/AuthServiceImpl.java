package com.lms.authservice.service.impl;

import com.lms.authservice.dto.request.LoginRequestDTO;
import com.lms.authservice.dto.request.RegisterRequestDTO;
import com.lms.authservice.dto.response.AuthResponseDTO;
import com.lms.authservice.dto.response.UserResponseDTO;
import com.lms.authservice.dto.response.ValidateTokenResponseDTO;
import com.lms.authservice.entity.User;
import com.lms.authservice.mapper.UserMapper;
import com.lms.authservice.repository.UserRepository;
import com.lms.authservice.security.JwtUtil;
import com.lms.authservice.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;

import java.util.List;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private BCryptPasswordEncoder encoder;

    @Autowired
    private RestTemplate restTemplate;

    @Override
    @Transactional
    public AuthResponseDTO register(RegisterRequestDTO request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return new AuthResponseDTO("Email already in use", null);
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(encoder.encode(request.getPassword()));
        
        user.setRole("STUDENT");

        User savedUser = userRepository.save(user);

        // Synchronously call User Service to create the user profile.
        // If this HTTP call fails, the transaction is rolled back.
        Map<String, Object> profileRequest = new HashMap<>();
        profileRequest.put("id", savedUser.getId());
        profileRequest.put("name", savedUser.getName());
        profileRequest.put("email", savedUser.getEmail());
        profileRequest.put("role", savedUser.getRole());

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(profileRequest, headers);
            
            restTemplate.postForEntity("http://localhost:8082/api/users", entity, Void.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create user profile in User Service. Registration rolled back: " + e.getMessage(), e);
        }

        String token = jwtUtil.generateToken(savedUser.getId(), savedUser.getEmail(), savedUser.getRole());

        return new AuthResponseDTO("User registered successfully", token);
    }

    @Override
    public AuthResponseDTO login(LoginRequestDTO request) {

        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            return new AuthResponseDTO("User not found", null);
        }

        User user = userOpt.get();

        if (!encoder.matches(request.getPassword(), user.getPassword())) {
            return new AuthResponseDTO("Invalid password", null);
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());

        return new AuthResponseDTO("Login successful", token);
    }

    @Override
    public ValidateTokenResponseDTO validateToken(String token) {
        if (token == null || !jwtUtil.validateToken(token)) {
            return new ValidateTokenResponseDTO(false, null, null, null);
        }
        try {
            Long userId = jwtUtil.extractUserId(token);
            String email = jwtUtil.extractEmail(token);
            String role = jwtUtil.extractRole(token);
            return new ValidateTokenResponseDTO(true, userId, email, role);
        } catch (Exception e) {
            return new ValidateTokenResponseDTO(false, null, null, null);
        }
    }

    @Override
    public UserResponseDTO updateUserRole(Long userId, String role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Enforce: Users cannot modify their own roles.
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof String) {
            String callerEmail = (String) auth.getPrincipal();
            if (user.getEmail().equalsIgnoreCase(callerEmail)) {
                throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Users cannot modify their own roles.");
            }
        }

        user.setRole(role.trim().toUpperCase());
        User updatedUser = userRepository.save(user);
        return UserMapper.toDTO(updatedUser);
    }

    @Override
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponseDTO getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        return UserMapper.toDTO(user);
    }

    @Override
    @Transactional
    public void deleteUser(Long userId, String authHeader) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Call User Service to delete the user profile.
        try {
            HttpHeaders headers = new HttpHeaders();
            if (authHeader != null) {
                headers.set("Authorization", authHeader);
            }
            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
            String userServiceUrl = "http://localhost:8082/api/users/" + userId;
            restTemplate.exchange(userServiceUrl, HttpMethod.DELETE, requestEntity, Void.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete user profile in User Service. Deletion rolled back: " + e.getMessage(), e);
        }

        userRepository.delete(user);
    }
}