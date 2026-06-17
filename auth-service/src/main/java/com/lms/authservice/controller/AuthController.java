package com.lms.authservice.controller;

import com.lms.authservice.dto.request.LoginRequestDTO;
import com.lms.authservice.dto.request.RegisterRequestDTO;
import com.lms.authservice.dto.request.RoleUpdateRequestDTO;
import com.lms.authservice.dto.response.AuthResponseDTO;
import com.lms.authservice.dto.response.UserResponseDTO;
import com.lms.authservice.dto.response.ValidateTokenResponseDTO;
import com.lms.authservice.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@RequestBody RegisterRequestDTO request) {
        AuthResponseDTO response = authService.register(request);
        if (response.getToken() != null) {
            ResponseCookie cookie = ResponseCookie.from("jwt", response.getToken())
                    .httpOnly(true)
                    .secure(false) // Set to true in prod (HTTPS)
                    .path("/")
                    .maxAge(24 * 60 * 60)
                    .sameSite("Lax")
                    .build();
            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(response);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody LoginRequestDTO request) {
        AuthResponseDTO response = authService.login(request);
        if (response.getToken() != null) {
            ResponseCookie cookie = ResponseCookie.from("jwt", response.getToken())
                    .httpOnly(true)
                    .secure(false) // Set to true in prod (HTTPS)
                    .path("/")
                    .maxAge(24 * 60 * 60)
                    .sameSite("Lax")
                    .build();
            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(response);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<AuthResponseDTO> logout() {
        ResponseCookie cookie = ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0) // immediately expire
                .sameSite("Lax")
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new AuthResponseDTO("Logout successful", null));
    }

    @RequestMapping(value = "/validate", method = {RequestMethod.GET, RequestMethod.POST})
    public ResponseEntity<ValidateTokenResponseDTO> validateToken(
            @CookieValue(name = "jwt", required = false) String cookieToken,
            @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String authHeader,
            @RequestParam(name = "token", required = false) String paramToken) {

        String token = null;
        if (cookieToken != null) {
            token = cookieToken;
        } else if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        } else if (paramToken != null) {
            token = paramToken;
        }

        ValidateTokenResponseDTO validationResult = authService.validateToken(token);
        if (!validationResult.isValid()) {
            return ResponseEntity.status(401).body(validationResult);
        }
        return ResponseEntity.ok(validationResult);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getProfile() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof String) {
            String email = (String) principal;
            UserResponseDTO userResponse = authService.getCurrentUser(email);
            return ResponseEntity.ok(userResponse);
        }
        return ResponseEntity.status(401).build();
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        return ResponseEntity.ok(authService.getAllUsers());
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<UserResponseDTO> updateUserRole(
            @PathVariable Long userId,
            @RequestBody RoleUpdateRequestDTO request) {
        UserResponseDTO response = authService.updateUserRole(userId, request.getRole());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long userId,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {
        authService.deleteUser(userId, authHeader);
        return ResponseEntity.noContent().build();
    }
}