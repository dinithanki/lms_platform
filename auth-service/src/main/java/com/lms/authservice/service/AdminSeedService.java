package com.lms.authservice.service;

import com.lms.authservice.entity.User;
import com.lms.authservice.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class AdminSeedService {
    private static final Logger log = LoggerFactory.getLogger(AdminSeedService.class);

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final RestTemplate restTemplate;

    @Value("${app.auth-service.token:}")
    private String authServiceToken;

    @Value("${app.user-service.url:http://localhost:8082}")
    private String userServiceUrl = "http://localhost:8082";

    public AdminSeedService(UserRepository userRepository,
                            BCryptPasswordEncoder passwordEncoder,
                            RestTemplate restTemplate) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.restTemplate = restTemplate;
    }

    @Transactional
    public SeedResult createAdminIfMissing(String email, String name, String rawPassword) {
        if (userRepository.findByEmail(email).isPresent()) {
            return SeedResult.ALREADY_EXISTS;
        }

        User user = new User();
        user.setEmail(email);
        user.setName(name);
        user.setRole("ADMIN");
        user.setPassword(passwordEncoder.encode(rawPassword));

        User savedUser = userRepository.save(user);
        createUserServiceProfile(savedUser);
        return SeedResult.CREATED;
    }

    private void createUserServiceProfile(User user) {
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("name", user.getName());
        profile.put("email", user.getEmail());
        profile.put("role", user.getRole());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Auth-Service-Token", authServiceToken);

        try {
            restTemplate.postForEntity(userServiceUrl + "/api/users", new HttpEntity<>(profile, headers), Void.class);
        } catch (RestClientException exception) {
            log.error("Admin seed profile synchronization failed; the Auth Service transaction will roll back.");
            throw new IllegalStateException("Could not create the User Service profile for the seeded admin", exception);
        }
    }

    public enum SeedResult {
        CREATED,
        ALREADY_EXISTS
    }
}
