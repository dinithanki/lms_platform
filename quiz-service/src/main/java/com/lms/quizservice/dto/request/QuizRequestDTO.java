package com.lms.quizservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class QuizRequestDTO {

    @NotNull(message = "Course ID is required")
    private Long courseId;

    @NotBlank(message = "Quiz title is required")
    private String title;

    private String description;

    private boolean published;
}
