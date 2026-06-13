package com.lms.quizservice.service;

import com.lms.quizservice.dto.request.QuizRequestDTO;
import com.lms.quizservice.dto.request.SubmitQuizRequestDTO;
import com.lms.quizservice.dto.response.QuizResponseDTO;
import com.lms.quizservice.dto.response.QuizResultResponseDTO;

public interface QuizService {
    QuizResponseDTO createQuiz(QuizRequestDTO dto);
    QuizResponseDTO updateQuiz(Long id, QuizRequestDTO dto);
    void deleteQuiz(Long id);
    QuizResponseDTO getQuizByCourseId(Long courseId, Long studentId);
    QuizResponseDTO getQuizById(Long id);
    QuizResponseDTO publishQuiz(Long id);
    QuizResultResponseDTO submitQuiz(SubmitQuizRequestDTO request);
}
