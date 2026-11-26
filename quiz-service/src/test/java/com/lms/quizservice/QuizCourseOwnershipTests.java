package com.lms.quizservice;

import com.lms.quizservice.client.CourseClient;
import com.lms.quizservice.dto.request.QuizRequestDTO;
import com.lms.quizservice.dto.response.QuizResponseDTO;
import com.lms.quizservice.entity.Quiz;
import com.lms.quizservice.mapper.QuizMapper;
import com.lms.quizservice.repository.AttemptRepository;
import com.lms.quizservice.repository.QuizRepository;
import com.lms.quizservice.security.LmsPrincipal;
import com.lms.quizservice.service.impl.QuizServiceImpl;
import feign.FeignException;
import feign.Request;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QuizCourseOwnershipTests {
    @Mock private QuizRepository quizRepository;
    @Mock private AttemptRepository attemptRepository;
    @Mock private QuizMapper quizMapper;
    @Mock private CourseClient courseClient;
    @InjectMocks private QuizServiceImpl quizService;

    @Test
    void adminCanCreateQuizForExistingCourse() {
        givenCreateSucceeds(9L);
        when(courseClient.getCourseOwnerId(9L)).thenReturn(72L);

        assertNotNull(quizService.createQuiz(request(9L), principal("ADMIN", 1L)));
        verify(courseClient).getCourseOwnerId(9L);
    }

    @Test
    void instructorCanCreateQuizForOwnedCourse() {
        givenCreateSucceeds(9L);
        when(courseClient.getCourseOwnerId(9L)).thenReturn(22L);

        assertNotNull(quizService.createQuiz(request(9L), principal("INSTRUCTOR", 22L)));
        verify(courseClient).getCourseOwnerId(9L);
    }

    @Test
    void instructorCannotCreateQuizForAnotherInstructorsCourse() {
        when(courseClient.getCourseOwnerId(9L)).thenReturn(23L);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> quizService.createQuiz(request(9L), principal("INSTRUCTOR", 22L)));
        assertEquals(403, exception.getStatusCode().value());
        verify(quizRepository, never()).save(any());
    }

    @Test
    void studentsCannotCreateQuizEvenIfServiceIsCalledDirectly() {
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> quizService.createQuiz(request(9L), principal("STUDENT", 10L)));
        assertEquals(403, exception.getStatusCode().value());
        verifyNoInteractions(courseClient, quizRepository);
    }

    @Test
    void nonexistentCourseIsReportedAsNotFound() {
        Request request = Request.create(Request.HttpMethod.GET, "http://course-service/internal/courses/404/owner",
                Map.of(), null, StandardCharsets.UTF_8, null);
        FeignException.NotFound notFound = new FeignException.NotFound("course missing", request, null, Map.of());
        when(courseClient.getCourseOwnerId(404L)).thenThrow(notFound);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> quizService.createQuiz(request(404L), principal("ADMIN", 1L)));
        assertEquals(404, exception.getStatusCode().value());
        verify(quizRepository, never()).save(any());
    }

    private void givenCreateSucceeds(Long courseId) {
        when(quizRepository.existsByCourseId(courseId)).thenReturn(false);
        when(quizMapper.toEntity(any())).thenReturn(new Quiz());
        when(quizRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(quizMapper.toResponseDTO(any())).thenReturn(new QuizResponseDTO());
    }

    private QuizRequestDTO request(Long courseId) {
        QuizRequestDTO dto = new QuizRequestDTO();
        dto.setCourseId(courseId);
        dto.setTitle("Final quiz");
        return dto;
    }

    private LmsPrincipal principal(String role, Long id) {
        return new LmsPrincipal(id, "user@example.test", role);
    }
}
