package com.lms.quizservice.mapper;

import com.lms.quizservice.dto.response.QuizResultResponseDTO;
import com.lms.quizservice.entity.QuizAttempt;
import org.springframework.stereotype.Component;

@Component
public class AttemptMapper {

    public QuizResultResponseDTO toResponseDTO(QuizAttempt attempt) {
        if (attempt == null) {
            return null;
        }
        QuizResultResponseDTO dto = new QuizResultResponseDTO();
        dto.setId(attempt.getId());
        dto.setQuizId(attempt.getQuizId());
        dto.setStudentId(attempt.getStudentId());
        dto.setScore(attempt.getScore());
        dto.setAttemptNumber(attempt.getAttemptNumber());
        dto.setPassStatus(attempt.getPassStatus());
        dto.setAttemptTime(attempt.getAttemptTime());
        return dto;
    }
}
