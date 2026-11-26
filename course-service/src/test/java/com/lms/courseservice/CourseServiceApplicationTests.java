package com.lms.courseservice;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {"jwt.secret=test-only-jwt-secret-that-is-long-enough-123456", "app.quiz-service.token=test-only-quiz-service-token-long-enough-123456"})
class CourseServiceApplicationTests {

    @Test
    void contextLoads() {
    }

}
