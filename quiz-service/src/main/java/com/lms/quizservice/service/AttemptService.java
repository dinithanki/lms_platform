package com.lms.quizservice.service;

import com.lms.quizservice.dto.response.QuizResultResponseDTO;
import java.util.List;

public interface AttemptService {
    List<QuizResultResponseDTO> getAttemptsByStudentId(Long studentId);
    List<QuizResultResponseDTO> getAttemptsByStudentIdAndQuizId(Long studentId, Long quizId);
}
