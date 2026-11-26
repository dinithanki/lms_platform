package com.lms.quizservice;

import com.lms.quizservice.config.CourseClientAuthConfig;
import feign.RequestTemplate;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class CourseClientAuthConfigTests {
    @Test
    void quizResultPersistenceUsesDedicatedServiceCredential() {
        String serviceToken = "test-only-quiz-service-token-long-enough-123456";
        CourseClientAuthConfig config = new CourseClientAuthConfig();
        ReflectionTestUtils.setField(config, "quizServiceToken", serviceToken);
        RequestTemplate template = new RequestTemplate().method("POST").uri("/courses/5/quiz");

        feign.RequestInterceptor interceptor = ReflectionTestUtils.invokeMethod(config, "forwardCallerAuthorization");
        interceptor.apply(template);

        assertTrue(template.headers().get("X-Quiz-Service-Token").contains(serviceToken));
        assertFalse(template.headers().containsKey("Authorization"));
    }

    @Test
    void courseOwnershipLookupUsesDedicatedServiceCredential() {
        String serviceToken = "test-only-quiz-service-token-long-enough-123456";
        CourseClientAuthConfig config = new CourseClientAuthConfig();
        ReflectionTestUtils.setField(config, "quizServiceToken", serviceToken);
        RequestTemplate template = new RequestTemplate().method("GET").uri("/internal/courses/9/owner");
        template.header("Authorization", "Bearer end-user-token");

        feign.RequestInterceptor interceptor = ReflectionTestUtils.invokeMethod(config, "forwardCallerAuthorization");
        interceptor.apply(template);

        assertTrue(template.headers().get("X-Quiz-Service-Token").contains(serviceToken));
        assertFalse(template.headers().containsKey("Authorization"));
    }
}
