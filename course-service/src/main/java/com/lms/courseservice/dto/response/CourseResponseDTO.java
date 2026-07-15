package com.lms.courseservice.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class CourseResponseDTO {
    private Long id;
    private String title;
    private String description;
    private List<ModuleResponseDTO> modules;
}
