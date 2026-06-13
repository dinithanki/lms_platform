package com.lms.courseservice.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EnrollmentRequestDTO {

    @NotNull(message = "Student ID is required")
    private Long studentId;
}
