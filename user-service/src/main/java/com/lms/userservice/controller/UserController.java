package com.lms.userservice.controller;

import com.lms.userservice.dto.RoleUpdateRequestDTO;
import com.lms.userservice.dto.UserCreateRequestDTO;
import com.lms.userservice.dto.UserProfileResponseDTO;
import com.lms.userservice.dto.UserUpdateRequestDTO;
import com.lms.userservice.entity.User;
import com.lms.userservice.security.UserPrincipal;
import com.lms.userservice.service.UserService;
import jakarta.servlet.ServletContext;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private ServletContext servletContext;

    @PostMapping
    public ResponseEntity<UserProfileResponseDTO> createUserProfile(@Valid @RequestBody UserCreateRequestDTO dto) {
        User user = userService.createUser(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserProfileResponseDTO> getUserProfileById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(convertToDTO(user));
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponseDTO> getLoggedInUserProfile(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = userService.getUserById(principal.getId());
        return ResponseEntity.ok(convertToDTO(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserProfileResponseDTO> updateUserProfile(
            @PathVariable Long id,
            @RequestBody UserUpdateRequestDTO dto,
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = userService.updateUser(id, dto, principal);
        return ResponseEntity.ok(convertToDTO(user));
    }

    @PostMapping("/{id}/profile-picture")
    public ResponseEntity<UserProfileResponseDTO> uploadProfilePicture(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = userService.updateProfileImage(id, file, principal);
        return ResponseEntity.ok(convertToDTO(user));
    }

    @GetMapping("/{id}/profile-picture")
    public ResponseEntity<Resource> getProfilePicture(@PathVariable Long id) {
        Resource resource = userService.getProfileImage(id);
        String contentType = null;
        try {
            contentType = servletContext.getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException e) {
            // Keep null to fall back
        }
        if (contentType == null) {
            contentType = "image/jpeg";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                .header(HttpHeaders.PRAGMA, "no-cache")
                .header(HttpHeaders.EXPIRES, "0")
                .body(resource);
    }

    @GetMapping
    public ResponseEntity<List<UserProfileResponseDTO>> getAllUserProfiles() {
        List<UserProfileResponseDTO> dtos = userService.getAllUsers().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserProfile(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<UserProfileResponseDTO> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody RoleUpdateRequestDTO dto,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        if (principal != null && principal.getId().equals(id)) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.BAD_REQUEST, "Users cannot modify their own roles.");
        }
        User user = userService.updateUserRole(id, dto.getRole(), authHeader);
        return ResponseEntity.ok(convertToDTO(user));
    }

    /**
     * Internal sync endpoint — called by auth-service to push role changes into user-service DB.
     * Does NOT call back to auth-service (no circular loop).
     */
    @PutMapping("/{id}/role/sync")
    public ResponseEntity<UserProfileResponseDTO> syncUserRole(
            @PathVariable Long id,
            @Valid @RequestBody RoleUpdateRequestDTO dto) {
        User user = userService.syncUserRole(id, dto.getRole());
        return ResponseEntity.ok(convertToDTO(user));
    }

    private UserProfileResponseDTO convertToDTO(User user) {
        UserProfileResponseDTO dto = new UserProfileResponseDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setPhone(user.getPhone());
        dto.setBio(user.getBio());
        dto.setProfileImageUrl(user.getProfileImageUrl());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        return dto;
    }
}
