package com.lms.quizservice.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class QuizResultResponseDTO {
    private Long id;
    private Long quizId;
    private Long studentId;
    private double score;
    private int attemptNumber;
    private String passStatus;
    private LocalDateTime attemptTime;
}
