package com.lms.courseservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class ModuleRequestDTO {

    @NotBlank(message = "Module title is required")
    private String title;

    private String description;

    @NotBlank(message = "Video URL is required")
    private String videoUrl;

    private String resourceUrl;

    private Integer sequenceOrder;
}
