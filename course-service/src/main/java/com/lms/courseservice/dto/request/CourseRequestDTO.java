package com.lms.courseservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CourseRequestDTO {

    @NotBlank(message = "Course title is required")
    @Size(max = 100, message = "Course title must be at most 100 characters")
    private String title;

    @Size(max = 1000, message = "Course description must be at most 1000 characters")
    private String description;
}
