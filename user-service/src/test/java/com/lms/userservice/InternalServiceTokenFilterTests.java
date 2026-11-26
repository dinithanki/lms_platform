package com.lms.userservice;

import com.lms.userservice.security.InternalServiceTokenFilter;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.concurrent.atomic.AtomicBoolean;

import static org.junit.jupiter.api.Assertions.*;

class InternalServiceTokenFilterTests {
    private static final String INTERNAL_TOKEN = "test-only-auth-service-token-long-enough-123456";

    @AfterEach
    void clearSecurityContext() { SecurityContextHolder.clearContext(); }

    @Test
    void roleSyncRejectsPublicCallAndAcceptsAuthServiceCredential() throws Exception {
        InternalServiceTokenFilter filter = new InternalServiceTokenFilter();
        ReflectionTestUtils.setField(filter, "expectedToken", INTERNAL_TOKEN);
        MockHttpServletRequest request = new MockHttpServletRequest("PUT", "/api/users/12/role/sync");
        request.setServletPath("/api/users/12/role/sync");
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean reached = new AtomicBoolean();
        FilterChain chain = (req, res) -> reached.set(true);

        filter.doFilter(request, response, chain);
        assertEquals(401, response.getStatus());
        assertFalse(reached.get());

        request.addHeader("X-Auth-Service-Token", INTERNAL_TOKEN);
        response = new MockHttpServletResponse();
        filter.doFilter(request, response, chain);
        assertTrue(reached.get());
        assertTrue(SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_SERVICE")));
    }
}
