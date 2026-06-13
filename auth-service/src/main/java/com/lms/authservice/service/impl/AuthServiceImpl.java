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
import org.springframework.beans.factory.annotation.Value;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID;
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

    @Value("${notification-service.url:http://localhost:8085}")
    private String notificationServiceUrl;

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
        
        String assignedRole = request.getRole() != null && !request.getRole().trim().isEmpty() 
                ? request.getRole().trim().toUpperCase() 
                : "USER";
        user.setRole(assignedRole);
        
        // Account starts as verified immediately
        user.setVerified(true);

        User savedUser = userRepository.save(user);

        // Now, synchronously create the user profile in User Service
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

        // Send a welcome guideline in-app notification
        try {
            Map<String, Object> welcomeRequest = new HashMap<>();
            welcomeRequest.put("recipient", savedUser.getEmail());
            welcomeRequest.put("title", "Welcome to LMS Platform! 🎓");
            welcomeRequest.put("message", "We are excited to have you! Here is a quick guideline to get you started: \n1. Complete your profile details in the Profile tab.\n2. Browse active courses under Browse Courses.\n3. Enroll and navigate to My Courses to start studying!\n4. Take course quizzes and check your score to qualify for a certificate!");
            welcomeRequest.put("type", "GUIDELINE");

            HttpHeaders notificationHeaders = new HttpHeaders();
            notificationHeaders.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> welcomeEntity = new HttpEntity<>(welcomeRequest, notificationHeaders);

            restTemplate.postForEntity(notificationServiceUrl + "/api/notify/in-app", welcomeEntity, Void.class);
        } catch (Exception e) {
            System.err.println("Warning: Failed to send welcome guideline in-app notification: " + e.getMessage());
        }

        // Generate token and return directly so the frontend logs in the user immediately
        String token = jwtUtil.generateToken(savedUser.getId(), savedUser.getEmail(), savedUser.getRole());
        return new AuthResponseDTO("Registration successful.", token);
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

        if (!user.isVerified()) {
            return new AuthResponseDTO("Account is not verified. Please verify your email first.", null);
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());

        return new AuthResponseDTO("Login successful", token);
    }

    @Override
    @Transactional
    public AuthResponseDTO verifyOtp(String email, String otp) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return new AuthResponseDTO("User not found", null);
        }

        User user = userOpt.get();
        if (user.isVerified()) {
            return new AuthResponseDTO("Account is already verified", null);
        }

        if (user.getOtp() == null || !user.getOtp().equals(otp)) {
            return new AuthResponseDTO("Invalid verification code", null);
        }

        if (user.getOtpExpiry() == null || user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            return new AuthResponseDTO("Verification code has expired", null);
        }

        // OTP is valid! Verify user
        user.setVerified(true);
        user.setOtp(null);
        user.setOtpExpiry(null);
        User savedUser = userRepository.save(user);

        // Now, synchronously create the user profile in User Service
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
            throw new RuntimeException("Failed to create user profile in User Service. OTP verification rolled back: " + e.getMessage(), e);
        }

        // Send a welcome guideline in-app notification
        try {
            Map<String, Object> welcomeRequest = new HashMap<>();
            welcomeRequest.put("recipient", savedUser.getEmail());
            welcomeRequest.put("title", "Welcome to LMS Platform! 🎓");
            welcomeRequest.put("message", "We are excited to have you! Here is a quick guideline to get you started: \n1. Complete your profile details in the Profile tab.\n2. Browse active courses under Browse Courses.\n3. Enroll and navigate to My Courses to start studying!\n4. Take course quizzes and check your score to qualify for a certificate!");
            welcomeRequest.put("type", "GUIDELINE");

            HttpHeaders notificationHeaders = new HttpHeaders();
            notificationHeaders.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> welcomeEntity = new HttpEntity<>(welcomeRequest, notificationHeaders);

            restTemplate.postForEntity(notificationServiceUrl + "/api/notify/in-app", welcomeEntity, Void.class);
        } catch (Exception e) {
            System.err.println("Warning: Failed to send welcome guideline in-app notification: " + e.getMessage());
        }

        // Generate token
        String token = jwtUtil.generateToken(savedUser.getId(), savedUser.getEmail(), savedUser.getRole());
        return new AuthResponseDTO("Account verified successfully", token);
    }

    @Override
    public AuthResponseDTO requestForgotPassword(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            // Security practice: return success even if user not found to prevent user enumeration
            return new AuthResponseDTO("If the account exists, a password reset link has been sent to your email.", null);
        }

        User user = userOpt.get();
        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        // Output the reset link to the console for local debugging
        System.out.println("==================================================");
        System.out.println("DEBUG: PASSWORD RESET LINK FOR " + user.getEmail() + " IS:");
        System.out.println("http://localhost:5173/reset-password?token=" + token);
        System.out.println("==================================================");

        return new AuthResponseDTO("Password reset link has been generated. Please check server console logs.", null);
    }

    @Override
    public AuthResponseDTO resetPassword(String token, String newPassword) {
        Optional<User> userOpt = userRepository.findAll().stream()
                .filter(u -> token.equals(u.getResetToken()))
                .findFirst();

        if (userOpt.isEmpty()) {
            return new AuthResponseDTO("Invalid password reset token.", null);
        }

        User user = userOpt.get();
        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            return new AuthResponseDTO("Password reset token has expired.", null);
        }

        // Update password
        user.setPassword(encoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        return new AuthResponseDTO("Password has been reset successfully.", null);
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
}