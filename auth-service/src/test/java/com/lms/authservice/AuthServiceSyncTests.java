package com.lms.authservice;

import com.lms.authservice.dto.request.RegisterRequestDTO;
import com.lms.authservice.entity.User;
import com.lms.authservice.repository.UserRepository;
import com.lms.authservice.security.JwtUtil;
import com.lms.authservice.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class AuthServiceSyncTests {
    private static final String SERVICE_TOKEN = "test-only-auth-service-token-long-enough-123456";
    private AuthServiceImpl authService;
    private UserRepository userRepository;
    private RestTemplate restTemplate;
    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        authService = new AuthServiceImpl();
        userRepository = mock(UserRepository.class);
        restTemplate = mock(RestTemplate.class);
        jwtUtil = mock(JwtUtil.class);
        ReflectionTestUtils.setField(authService, "userRepository", userRepository);
        ReflectionTestUtils.setField(authService, "restTemplate", restTemplate);
        ReflectionTestUtils.setField(authService, "jwtUtil", jwtUtil);
        ReflectionTestUtils.setField(authService, "encoder", new BCryptPasswordEncoder());
        ReflectionTestUtils.setField(authService, "authServiceToken", SERVICE_TOKEN);
    }

    @AfterEach
    void clearSecurityContext() {
        org.springframework.security.core.context.SecurityContextHolder.clearContext();
    }

    @Test
    void registrationSendsAuthServiceCredentialToCreateProfile() {
        when(userRepository.findByEmail("student@example.test")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(7L);
            return user;
        });
        when(jwtUtil.generateToken(7L, "student@example.test", "STUDENT")).thenReturn("test-jwt");
        when(restTemplate.postForEntity(eq("http://localhost:8082/api/users"), any(HttpEntity.class), eq(Void.class)))
                .thenReturn(ResponseEntity.status(201).<Void>build());

        RegisterRequestDTO request = new RegisterRequestDTO();
        request.setName("Student");
        request.setEmail("student@example.test");
        request.setPassword("password");
        assertEquals("test-jwt", authService.register(request).getToken());

        org.mockito.ArgumentCaptor<HttpEntity> requestCaptor = org.mockito.ArgumentCaptor.forClass(HttpEntity.class);
        verify(restTemplate).postForEntity(eq("http://localhost:8082/api/users"), requestCaptor.capture(), eq(Void.class));
        assertEquals(SERVICE_TOKEN, requestCaptor.getValue().getHeaders().getFirst("X-Auth-Service-Token"));
    }

    @Test
    void roleUpdateSendsAuthServiceCredentialToSyncRole() {
        User user = new User();
        user.setId(9L);
        user.setEmail("user@example.test");
        when(userRepository.findById(9L)).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);
        when(restTemplate.exchange(eq("http://localhost:8082/api/users/9/role/sync"), eq(HttpMethod.PUT),
                any(HttpEntity.class), eq(Void.class))).thenReturn(ResponseEntity.ok().<Void>build());

        assertEquals("ADMIN", authService.updateUserRole(9L, "admin").getRole());
        org.mockito.ArgumentCaptor<HttpEntity> requestCaptor = org.mockito.ArgumentCaptor.forClass(HttpEntity.class);
        verify(restTemplate).exchange(eq("http://localhost:8082/api/users/9/role/sync"), eq(HttpMethod.PUT),
                requestCaptor.capture(), eq(Void.class));
        assertEquals(SERVICE_TOKEN, requestCaptor.getValue().getHeaders().getFirst("X-Auth-Service-Token"));
    }
}
