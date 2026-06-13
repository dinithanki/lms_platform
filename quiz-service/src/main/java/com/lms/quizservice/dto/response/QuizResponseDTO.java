package com.lms.quizservice.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class QuizResponseDTO {
    private Long id;
    private Long courseId;
    private String title;
    private String description;
    private boolean published;
    private List<QuestionResponseDTO> questions;
}
