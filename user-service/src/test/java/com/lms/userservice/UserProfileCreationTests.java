package com.lms.userservice;

import com.lms.userservice.dto.UserCreateRequestDTO;
import com.lms.userservice.entity.User;
import com.lms.userservice.repository.UserRepository;
import com.lms.userservice.service.FileStorageService;
import com.lms.userservice.service.impl.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserProfileCreationTests {
    private UserRepository userRepository;
    private UserServiceImpl userService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        userService = new UserServiceImpl();
        ReflectionTestUtils.setField(userService, "userRepository", userRepository);
        ReflectionTestUtils.setField(userService, "fileStorageService", mock(FileStorageService.class));
    }

    @Test
    void exactIdAndEmailRetryReturnsExistingProfileWithoutChangingIt() {
        User existing = new User();
        existing.setId(118L);
        existing.setEmail("admin@example.test");
        existing.setName("Original Name");
        existing.setRole("ADMIN");
        when(userRepository.findById(118L)).thenReturn(Optional.of(existing));

        User result = userService.createUser(request(118L, "admin@example.test", "Retry Name", "STUDENT"));

        assertSame(existing, result);
        assertEquals("Original Name", result.getName());
        assertEquals("ADMIN", result.getRole());
        verify(userRepository, never()).save(any(User.class));
        verify(userRepository, never()).findByEmail(anyString());
    }

    @Test
    void sameIdWithDifferentEmailStillFails() {
        User existing = new User();
        existing.setId(118L);
        existing.setEmail("admin@example.test");
        when(userRepository.findById(118L)).thenReturn(Optional.of(existing));

        assertThrows(ResponseStatusException.class,
                () -> userService.createUser(request(118L, "different@example.test", "Name", "ADMIN")));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void newProfileCreationStillNormalizesRoleAndSavesProfile() {
        when(userRepository.findById(118L)).thenReturn(Optional.empty());
        when(userRepository.findByEmail("admin@example.test")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User result = userService.createUser(request(118L, "admin@example.test", "New Admin", "admin"));

        assertEquals(118L, result.getId());
        assertEquals("ADMIN", result.getRole());
        verify(userRepository).save(any(User.class));
    }

    private UserCreateRequestDTO request(Long id, String email, String name, String role) {
        UserCreateRequestDTO dto = new UserCreateRequestDTO();
        dto.setId(id);
        dto.setEmail(email);
        dto.setName(name);
        dto.setRole(role);
        return dto;
    }
}
