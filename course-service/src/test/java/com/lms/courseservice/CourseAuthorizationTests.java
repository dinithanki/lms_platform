package com.lms.courseservice;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lms.courseservice.dto.request.CourseRequestDTO;
import com.lms.courseservice.dto.response.CourseResponseDTO;
import com.lms.courseservice.service.CourseService;
import com.lms.courseservice.controller.CourseController;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.context.annotation.Import;
import com.lms.courseservice.security.JwtUtil;
import com.lms.courseservice.security.SecurityConfig;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CourseController.class)
@Import({JwtUtil.class, SecurityConfig.class})
@TestPropertySource(properties = {"jwt.secret=test-only-jwt-secret-that-is-long-enough-123456", "app.quiz-service.token=test-only-quiz-service-token-long-enough-123456"})
class CourseAuthorizationTests {
    private static final String SECRET = "test-only-jwt-secret-that-is-long-enough-123456";

    @Autowired private MockMvc mvc;
    @Autowired private ObjectMapper objectMapper;
    @MockBean private CourseService courseService;

    @Test
    void catalogueRemainsPublic() throws Exception {
        when(courseService.getAllCourses()).thenReturn(List.of());
        mvc.perform(get("/courses")).andExpect(status().isOk());
    }

    @Test
    void adminAndInstructorCanCreateCourseButStudentCannot() throws Exception {
        CourseRequestDTO request = new CourseRequestDTO();
        request.setTitle("Course");
        request.setDescription("Description");
        when(courseService.createCourse(any(), any())).thenReturn(new CourseResponseDTO());
        mvc.perform(post("/courses").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsBytes(request))
                        .header("Authorization", "Bearer " + token("STUDENT", 10L)))
                .andExpect(status().isForbidden());
        mvc.perform(post("/courses").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsBytes(request))
                        .header("Authorization", "Bearer " + token("ADMIN", 1L)))
                .andExpect(status().isCreated());
        mvc.perform(post("/courses").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsBytes(request))
                        .header("Authorization", "Bearer " + token("INSTRUCTOR", 22L)))
                .andExpect(status().isCreated());
        verify(courseService).createCourse(any(), eq(1L));
        verify(courseService).createCourse(any(), eq(22L));
    }

    private String token(String role, Long id) {
        return Jwts.builder().subject("user@example.test").claim("id", id).claim("role", role)
                .issuedAt(new Date()).expiration(new Date(System.currentTimeMillis() + 60_000))
                .signWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8)), SignatureAlgorithm.HS256).compact();
    }
}
