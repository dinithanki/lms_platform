package com.lms.quizservice.service;

import com.lms.quizservice.dto.request.QuizRequestDTO;
import com.lms.quizservice.dto.request.SubmitQuizRequestDTO;
import com.lms.quizservice.dto.response.QuizResponseDTO;
import com.lms.quizservice.dto.response.QuizResultResponseDTO;
import com.lms.quizservice.security.LmsPrincipal;

public interface QuizService {
    QuizResponseDTO createQuiz(QuizRequestDTO dto, LmsPrincipal principal);
    QuizResponseDTO updateQuiz(Long id, QuizRequestDTO dto, LmsPrincipal principal);
    void deleteQuiz(Long id, LmsPrincipal principal);
    QuizResponseDTO getQuizByCourseId(Long courseId, Long studentId);
    QuizResponseDTO getQuizById(Long id);
    QuizResponseDTO publishQuiz(Long id, LmsPrincipal principal);
    void requireQuizManagementAccess(Long quizId, LmsPrincipal principal);
    void requireCourseOwnership(Long courseId, LmsPrincipal principal);
    QuizResultResponseDTO submitQuiz(SubmitQuizRequestDTO request);
}
