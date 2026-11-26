package com.lms.courseservice;

import com.lms.courseservice.controller.InternalCourseController;
import com.lms.courseservice.entity.Course;
import com.lms.courseservice.exception.CourseNotFoundException;
import com.lms.courseservice.security.JwtUtil;
import com.lms.courseservice.security.SecurityConfig;
import com.lms.courseservice.service.CourseService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(InternalCourseController.class)
@Import({JwtUtil.class, SecurityConfig.class})
@TestPropertySource(properties = {
        "jwt.secret=test-only-jwt-secret-that-is-long-enough-123456",
        "app.quiz-service.token=test-only-quiz-service-token-long-enough-123456"
})
class InternalCourseControllerTests {
    private static final String SERVICE_TOKEN = "test-only-quiz-service-token-long-enough-123456";

    @Autowired private MockMvc mvc;
    @MockBean private CourseService courseService;

    @Test
    void ownerEndpointReturnsOwnerOnlyWithQuizServiceCredential() throws Exception {
        Course course = new Course();
        course.setOwnerId(22L);
        when(courseService.getCourseEntityById(9L)).thenReturn(course);

        mvc.perform(get("/internal/courses/9/owner").servletPath("/internal/courses/9/owner")
                        .header("X-Quiz-Service-Token", SERVICE_TOKEN))
                .andExpect(status().isOk())
                .andExpect(content().string("22"));
        mvc.perform(get("/internal/courses/9/owner").servletPath("/internal/courses/9/owner"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void nonexistentCourseRemainsNotFound() throws Exception {
        when(courseService.getCourseEntityById(404L)).thenThrow(new CourseNotFoundException("Course with ID 404 not found"));

        mvc.perform(get("/internal/courses/404/owner").servletPath("/internal/courses/404/owner")
                        .header("X-Quiz-Service-Token", SERVICE_TOKEN))
                .andExpect(status().isNotFound());
    }
}
