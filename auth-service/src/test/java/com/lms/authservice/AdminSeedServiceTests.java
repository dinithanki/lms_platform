package com.lms.authservice;

import com.lms.authservice.entity.User;
import com.lms.authservice.repository.UserRepository;
import com.lms.authservice.service.AdminSeedService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class AdminSeedServiceTests {
    private static final String SERVICE_TOKEN = "test-only-auth-service-token-long-enough-123456";
    private static final String RAW_PASSWORD = "seed-test-password";

    private UserRepository userRepository;
    private RestTemplate restTemplate;
    private BCryptPasswordEncoder passwordEncoder;
    private AdminSeedService seedService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        restTemplate = mock(RestTemplate.class);
        passwordEncoder = new BCryptPasswordEncoder();
        seedService = new AdminSeedService(userRepository, passwordEncoder, restTemplate);
        ReflectionTestUtils.setField(seedService, "authServiceToken", SERVICE_TOKEN);
    }

    @Test
    void existingAdminEmailIsLeftCompletelyUnchanged() {
        User existing = new User();
        existing.setId(106L);
        existing.setEmail("admin1@gmail.com");
        existing.setName("Original Admin");
        existing.setRole("ADMIN");
        existing.setPassword("existing-hash");
        when(userRepository.findByEmail(existing.getEmail())).thenReturn(Optional.of(existing));

        assertEquals(AdminSeedService.SeedResult.ALREADY_EXISTS,
                seedService.createAdminIfMissing(existing.getEmail(), "Changed Name", RAW_PASSWORD));
        assertEquals("Original Admin", existing.getName());
        assertEquals("ADMIN", existing.getRole());
        assertEquals("existing-hash", existing.getPassword());
        verify(userRepository, never()).save(any(User.class));
        verifyNoInteractions(restTemplate);
    }

    @Test
    void createsHashedAdminAndSynchronizesProfile() {
        when(userRepository.findByEmail("new-admin@example.test")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(118L);
            return user;
        });
        when(restTemplate.postForEntity(eq("http://localhost:8082/api/users"), any(HttpEntity.class), eq(Void.class)))
                .thenReturn(ResponseEntity.status(201).<Void>build());

        assertEquals(AdminSeedService.SeedResult.CREATED,
                seedService.createAdminIfMissing("new-admin@example.test", "New Admin", RAW_PASSWORD));

        var userCaptor = org.mockito.ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User saved = userCaptor.getValue();
        assertEquals(118L, saved.getId());
        assertEquals("ADMIN", saved.getRole());
        assertTrue(passwordEncoder.matches(RAW_PASSWORD, saved.getPassword()));
        assertNotEquals(RAW_PASSWORD, saved.getPassword());

        var requestCaptor = org.mockito.ArgumentCaptor.forClass(HttpEntity.class);
        verify(restTemplate).postForEntity(eq("http://localhost:8082/api/users"), requestCaptor.capture(), eq(Void.class));
        HttpEntity<?> request = requestCaptor.getValue();
        assertEquals(SERVICE_TOKEN, request.getHeaders().getFirst("X-Auth-Service-Token"));
        assertEquals(Map.of("id", 118L, "name", "New Admin", "email", "new-admin@example.test", "role", "ADMIN"),
                request.getBody());
    }

    @Test
    void profileSynchronizationFailureFailsSeedAndServiceMethodIsTransactional() throws Exception {
        when(userRepository.findByEmail("new-admin@example.test")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(118L);
            return user;
        });
        when(restTemplate.postForEntity(eq("http://localhost:8082/api/users"), any(HttpEntity.class), eq(Void.class)))
                .thenThrow(new ResourceAccessException("User Service unavailable"));

        assertThrows(IllegalStateException.class,
                () -> seedService.createAdminIfMissing("new-admin@example.test", "New Admin", RAW_PASSWORD));
        assertNotNull(AdminSeedService.class
                .getMethod("createAdminIfMissing", String.class, String.class, String.class)
                .getAnnotation(Transactional.class));
        verify(userRepository).save(any(User.class));
    }

    @Test
    void repeatedExecutionDoesNotSaveOrSynchronizeTwice() {
        User saved = new User();
        saved.setId(118L);
        saved.setEmail("new-admin@example.test");
        saved.setName("New Admin");
        saved.setRole("ADMIN");
        saved.setPassword(passwordEncoder.encode(RAW_PASSWORD));

        when(userRepository.findByEmail("new-admin@example.test"))
                .thenReturn(Optional.empty(), Optional.of(saved));
        when(userRepository.save(any(User.class))).thenReturn(saved);
        when(restTemplate.postForEntity(eq("http://localhost:8082/api/users"), any(HttpEntity.class), eq(Void.class)))
                .thenReturn(ResponseEntity.status(201).<Void>build());

        assertEquals(AdminSeedService.SeedResult.CREATED,
                seedService.createAdminIfMissing("new-admin@example.test", "New Admin", RAW_PASSWORD));
        assertEquals(AdminSeedService.SeedResult.ALREADY_EXISTS,
                seedService.createAdminIfMissing("new-admin@example.test", "New Admin", RAW_PASSWORD));

        verify(userRepository, times(1)).save(any(User.class));
        verify(restTemplate, times(1)).postForEntity(eq("http://localhost:8082/api/users"), any(HttpEntity.class), eq(Void.class));
    }
}
