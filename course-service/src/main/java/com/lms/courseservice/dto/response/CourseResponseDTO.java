package com.lms.courseservice.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CourseResponseDTO {
    private Long id;
    private String title;
    private String description;
    private String createdBy;
    private LocalDateTime createdAt;
    private long enrolledStudentsCount;
}
