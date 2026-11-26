package com.lms.userservice;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {"jwt.secret=test-only-jwt-secret-that-is-long-enough-123456", "app.auth-service.token=test-only-auth-service-token-long-enough-123456"})
class UserServiceApplicationTests {

    @Test
    void contextLoads() {
    }

}
