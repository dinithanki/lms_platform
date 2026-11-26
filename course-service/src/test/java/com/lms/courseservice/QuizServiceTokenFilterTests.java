package com.lms.courseservice;

import com.lms.courseservice.security.QuizServiceTokenFilter;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.concurrent.atomic.AtomicBoolean;

import static org.junit.jupiter.api.Assertions.*;

class QuizServiceTokenFilterTests {
    private static final String SERVICE_TOKEN = "test-only-quiz-service-token-long-enough-123456";

    @AfterEach
    void clearSecurityContext() { SecurityContextHolder.clearContext(); }

    @Test
    void studentCannotPostScoresDirectlyAndQuizServiceCredentialIsAccepted() throws Exception {
        QuizServiceTokenFilter filter = new QuizServiceTokenFilter();
        ReflectionTestUtils.setField(filter, "expectedToken", SERVICE_TOKEN);
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/courses/5/quiz");
        request.setServletPath("/courses/5/quiz");
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean reached = new AtomicBoolean();
        FilterChain chain = (req, res) -> reached.set(true);

        filter.doFilter(request, response, chain);
        assertEquals(401, response.getStatus());
        assertFalse(reached.get());

        request.addHeader("X-Quiz-Service-Token", SERVICE_TOKEN);
        response = new MockHttpServletResponse();
        filter.doFilter(request, response, chain);
        assertTrue(reached.get());
        assertTrue(SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_QUIZ_SERVICE")));
    }

    @Test
    void onlyQuizServiceCredentialCanReadCourseOwnerInternally() throws Exception {
        QuizServiceTokenFilter filter = new QuizServiceTokenFilter();
        ReflectionTestUtils.setField(filter, "expectedToken", SERVICE_TOKEN);
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/internal/courses/9/owner");
        request.setServletPath("/internal/courses/9/owner");
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean reached = new AtomicBoolean();
        FilterChain chain = (req, res) -> reached.set(true);

        filter.doFilter(request, response, chain);
        assertEquals(401, response.getStatus());
        assertFalse(reached.get());

        request.addHeader("X-Quiz-Service-Token", SERVICE_TOKEN);
        response = new MockHttpServletResponse();
        filter.doFilter(request, response, chain);
        assertTrue(reached.get());
    }
}
