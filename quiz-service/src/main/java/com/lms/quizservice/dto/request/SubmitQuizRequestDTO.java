package com.lms.quizservice.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import java.util.List;

@Data
public class SubmitQuizRequestDTO {

    @NotNull(message = "Student ID is required")
    private Long studentId;

    @NotNull(message = "Quiz ID is required")
    private Long quizId;

    @NotEmpty(message = "Answers cannot be empty")
    @Valid
    private List<SubmittedAnswerDTO> answers;

    @Data
    public static class SubmittedAnswerDTO {
        @NotNull(message = "Question ID is required")
        private Long questionId;

        @NotBlank(message = "Selected option is required")
        @Pattern(regexp = "^[A-D]$", message = "Selected option must be A, B, C, or D")
        private String selectedOption;
    }
}
