package com.lms.courseservice.dto.response;

import lombok.Data;

@Data
public class ProgressResponseDTO {
    private Long studentId;
    private Long courseId;
    private long completedModulesCount;
    private long totalModulesCount;
    private double progressPercentage;
    private boolean quizUnlocked;
    private boolean courseCompleted;
}
