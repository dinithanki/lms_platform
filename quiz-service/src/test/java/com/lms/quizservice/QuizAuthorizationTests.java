package com.lms.quizservice;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lms.quizservice.dto.request.QuizRequestDTO;
import com.lms.quizservice.dto.response.QuestionResponseDTO;
import com.lms.quizservice.service.QuestionService;
import com.lms.quizservice.service.QuizService;
import com.lms.quizservice.client.CourseClient;
import com.lms.quizservice.dto.response.QuizResponseDTO;
import com.lms.quizservice.dto.response.ProgressResponseDTO;
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
import com.lms.quizservice.security.JwtUtil;
import com.lms.quizservice.security.SecurityConfig;
import com.lms.quizservice.controller.QuizController;
import com.lms.quizservice.controller.QuestionController;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.never;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {QuizController.class, QuestionController.class})
@Import({JwtUtil.class, SecurityConfig.class})
@TestPropertySource(properties = {"jwt.secret=test-only-jwt-secret-that-is-long-enough-123456", "app.quiz-service.token=test-only-quiz-service-token-long-enough-123456"})
class QuizAuthorizationTests {
    private static final String SECRET = "test-only-jwt-secret-that-is-long-enough-123456";

    @Autowired private MockMvc mvc;
    @Autowired private ObjectMapper objectMapper;
    @MockBean private QuizService quizService;
    @MockBean private QuestionService questionService;
    @MockBean private CourseClient courseClient;

    @Test
    void adminAndInstructorCanCreateQuizButStudentCannot() throws Exception {
        QuizRequestDTO request = new QuizRequestDTO();
        request.setCourseId(3L);
        request.setTitle("Quiz");
        when(quizService.createQuiz(any(), any())).thenReturn(null);
        mvc.perform(post("/quizzes").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsBytes(request))
                        .header("Authorization", "Bearer " + token("STUDENT", 10L)))
                .andExpect(status().isForbidden());
        mvc.perform(post("/quizzes").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsBytes(request))
                        .header("Authorization", "Bearer " + token("ADMIN", 1L)))
                .andExpect(status().isCreated());
        mvc.perform(post("/quizzes").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsBytes(request))
                        .header("Authorization", "Bearer " + token("INSTRUCTOR", 22L)))
                .andExpect(status().isCreated());
        verify(quizService).createQuiz(any(), eq(new com.lms.quizservice.security.LmsPrincipal(1L, "user@example.test", "ADMIN")));
        verify(quizService).createQuiz(any(), eq(new com.lms.quizservice.security.LmsPrincipal(22L, "user@example.test", "INSTRUCTOR")));
        verify(quizService, never()).createQuiz(any(), eq(new com.lms.quizservice.security.LmsPrincipal(10L, "user@example.test", "STUDENT")));
    }

    @Test
    void instructorCourseLookupUsesManagementViewAfterOwnershipCheck() throws Exception {
        QuizResponseDTO quiz = new QuizResponseDTO();
        quiz.setCourseId(9L);
        when(quizService.getQuizByCourseId(9L, null)).thenReturn(quiz);

        mvc.perform(get("/quizzes/course/9").header("Authorization", "Bearer " + token("INSTRUCTOR", 22L)))
                .andExpect(status().isOk());

        verify(quizService).requireCourseOwnership(9L,
                new com.lms.quizservice.security.LmsPrincipal(22L, "user@example.test", "INSTRUCTOR"));
        verify(quizService).getQuizByCourseId(9L, null);
        verify(quizService, never()).getQuizByCourseId(9L, 22L);
    }

    @Test
    void studentCourseLookupStillUsesStudentEligibilityFlow() throws Exception {
        QuizResponseDTO quiz = new QuizResponseDTO();
        quiz.setCourseId(9L);
        when(quizService.getQuizByCourseId(9L, 10L)).thenReturn(quiz);

        mvc.perform(get("/quizzes/course/9").param("studentId", "10")
                        .header("Authorization", "Bearer " + token("STUDENT", 10L)))
                .andExpect(status().isOk());

        verify(quizService).getQuizByCourseId(9L, 10L);
        verify(quizService, never()).requireCourseOwnership(eq(9L), any());
    }

    @Test
    void studentCannotSubmitForAnotherStudent() throws Exception {
        String request = """
                {"studentId":11,"quizId":5,"answers":[{"questionId":1,"selectedOption":"A"}]}
                """;
        mvc.perform(post("/quizzes/submit").contentType(MediaType.APPLICATION_JSON).content(request)
                        .header("Authorization", "Bearer " + token("STUDENT", 10L)))
                .andExpect(status().isForbidden());
    }

    @Test
    void studentQuestionListDoesNotExposeCorrectAnswer() throws Exception {
        QuestionResponseDTO question = new QuestionResponseDTO();
        question.setId(1L);
        question.setCorrectAnswer("A");
        QuizResponseDTO quiz = new QuizResponseDTO();
        quiz.setId(5L);
        quiz.setCourseId(2L);
        quiz.setPublished(true);
        ProgressResponseDTO progress = new ProgressResponseDTO();
        progress.setQuizUnlocked(true);
        when(quizService.getQuizById(5L)).thenReturn(quiz);
        when(courseClient.getCourseProgress(2L, 10L)).thenReturn(progress);
        when(questionService.getQuestionsByQuizId(5L)).thenReturn(List.of(question));
        mvc.perform(get("/questions/quiz/5").header("Authorization", "Bearer " + token("STUDENT", 10L)))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].correctAnswer").doesNotExist());
    }

    private String token(String role, Long id) {
        return Jwts.builder().subject("user@example.test").claim("id", id).claim("role", role)
                .issuedAt(new Date()).expiration(new Date(System.currentTimeMillis() + 60_000))
                .signWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8)), SignatureAlgorithm.HS256).compact();
    }
}
