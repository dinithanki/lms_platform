package com.lms.userservice;

import com.lms.userservice.controller.UserController;
import com.lms.userservice.entity.User;
import com.lms.userservice.security.UserPrincipal;
import com.lms.userservice.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserProfileAuthorizationTests {
    @Test
    void studentCanReadOwnProfileButNotAnotherStudents() {
        UserService service = mock(UserService.class);
        User user = new User();
        user.setId(10L);
        user.setEmail("student@example.test");
        user.setRole("STUDENT");
        when(service.getUserById(10L)).thenReturn(user);
        UserController controller = new UserController();
        ReflectionTestUtils.setField(controller, "userService", service);

        UserPrincipal principal = new UserPrincipal(10L, "student@example.test", "STUDENT");
        assertEquals(10L, controller.getUserProfileById(10L, principal).getBody().getId());
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> controller.getUserProfileById(11L, principal));
        assertEquals(403, exception.getStatusCode().value());
        verify(service, never()).getUserById(11L);
    }
}
