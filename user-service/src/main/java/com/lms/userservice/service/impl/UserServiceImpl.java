package com.lms.userservice.service.impl;

import com.lms.userservice.dto.UserCreateRequestDTO;
import com.lms.userservice.dto.UserUpdateRequestDTO;
import com.lms.userservice.entity.User;
import com.lms.userservice.repository.UserRepository;
import com.lms.userservice.security.UserPrincipal;
import com.lms.userservice.service.FileStorageService;
import com.lms.userservice.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private RestTemplate restTemplate;

    @Override
    @Transactional
    public User createUser(UserCreateRequestDTO dto) {
        if (userRepository.findById(dto.getId()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Profile already exists with id: " + dto.getId());
        }

        User user = new User();
        user.setId(dto.getId());
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setRole(dto.getRole().trim().toUpperCase());
        
        return userRepository.save(user);
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User profile not found with id: " + id));
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    @Transactional
    public User updateUser(Long id, UserUpdateRequestDTO dto, UserPrincipal principal) {
        if (!principal.getId().equals(id) && !principal.getRole().equalsIgnoreCase("ADMIN")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: You can only modify your own profile.");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User profile not found with id: " + id));

        if (dto.getName() != null && !dto.getName().trim().isEmpty()) {
            user.setName(dto.getName().trim());
        }
        if (dto.getPhone() != null) {
            user.setPhone(dto.getPhone().trim());
        }
        if (dto.getBio() != null) {
            user.setBio(dto.getBio().trim());
        }

        return userRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User profile not found with id: " + id));

        fileStorageService.deleteFile(id);
        userRepository.delete(user);
    }

    @Override
    @Transactional
    public User updateUserRole(Long id, String role, String authHeader) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User profile not found with id: " + id));

        user.setRole(role.trim().toUpperCase());
        User updatedUser = userRepository.save(user);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (authHeader != null) {
                headers.set("Authorization", authHeader);
            }

            Map<String, String> body = new HashMap<>();
            body.put("role", role.trim().toUpperCase());

            HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(body, headers);
            String authServiceUrl = "http://localhost:8081/api/auth/users/" + id + "/role";

            restTemplate.exchange(authServiceUrl, HttpMethod.PUT, requestEntity, Void.class);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to sync role update with Auth Service: " + e.getMessage(), e);
        }

        return updatedUser;
    }

    @Override
    @Transactional
    public User updateProfileImage(Long id, MultipartFile file, UserPrincipal principal) {
        if (!principal.getId().equals(id) && !principal.getRole().equalsIgnoreCase("ADMIN")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: You can only modify your own profile.");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User profile not found with id: " + id));

        String filename = fileStorageService.storeFile(id, file);

        String imageUrl = "/api/users/" + id + "/profile-picture";
        user.setProfileImageUrl(imageUrl);

        return userRepository.save(user);
    }

    @Override
    public Resource getProfileImage(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User profile not found with id: " + id);
        }

        Resource resource = fileStorageService.loadFileAsResource(id);
        if (resource == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile picture not found for user id: " + id);
        }
        return resource;
    }
}
