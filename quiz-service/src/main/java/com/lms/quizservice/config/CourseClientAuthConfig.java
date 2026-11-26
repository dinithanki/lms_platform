package com.lms.quizservice.config;

import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import jakarta.annotation.PostConstruct;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Configuration
public class CourseClientAuthConfig {
    @Value("${app.quiz-service.token:}")
    private String quizServiceToken;

    @PostConstruct
    void validateConfiguration() {
        if (quizServiceToken == null || quizServiceToken.getBytes(java.nio.charset.StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("LMS_QUIZ_SERVICE_TOKEN must contain at least 32 UTF-8 bytes");
        }
    }

    @Bean
    RequestInterceptor forwardCallerAuthorization() {
        return template -> {
            if (template.path().matches("/courses/\\d+/quiz")
                    || template.path().matches("/internal/courses/\\d+/owner")) {
                template.removeHeader("Authorization");
                template.header("X-Quiz-Service-Token", quizServiceToken);
                return;
            }
            RequestAttributes attributes = RequestContextHolder.getRequestAttributes();
            if (attributes instanceof ServletRequestAttributes servletAttributes) {
                String authorization = servletAttributes.getRequest().getHeader("Authorization");
                if (authorization == null && servletAttributes.getRequest().getCookies() != null) {
                    for (jakarta.servlet.http.Cookie cookie : servletAttributes.getRequest().getCookies()) {
                        if ("jwt".equals(cookie.getName())) {
                            authorization = "Bearer " + cookie.getValue();
                            break;
                        }
                    }
                }
                if (authorization != null && !authorization.isBlank()) template.header("Authorization", authorization);
            }
        };
    }
}
