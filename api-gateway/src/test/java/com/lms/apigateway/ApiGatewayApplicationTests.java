package com.lms.apigateway;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = "jwt.secret=test-only-jwt-secret-that-is-long-enough-123456")
class ApiGatewayApplicationTests {

    @Test
    void contextLoads() {
    }

}
