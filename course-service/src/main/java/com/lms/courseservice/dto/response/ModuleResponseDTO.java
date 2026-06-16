package com.lms.courseservice.dto.response;

import lombok.Data;

@Data
public class ModuleResponseDTO {
    private Long id;
    private Long courseId;
    private String title;
    private String description;
    private String videoUrl;
    private String resourceUrl;
}
