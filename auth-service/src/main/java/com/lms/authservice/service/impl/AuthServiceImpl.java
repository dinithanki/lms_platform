package com.lms.authservice.service.impl;

import com.lms.authservice.dto.request.LoginRequestDTO;
import com.lms.authservice.dto.request.RegisterRequestDTO;
import com.lms.authservice.dto.response.AuthResponseDTO;
import com.lms.authservice.entity.User;
import com.lms.authservice.repository.UserRepository;
import com.lms.authservice.security.JwtUtil;
import com.lms.authservice.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Override
    public AuthResponseDTO register(RegisterRequestDTO request) {

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(encoder.encode(request.getPassword()));
        user.setRole("USER");

        userRepository.save(user);

        return new AuthResponseDTO("User registered successfully", null);
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

        String token = jwtUtil.generateToken(user.getEmail());

        return new AuthResponseDTO("Login successful", token);
    }
}