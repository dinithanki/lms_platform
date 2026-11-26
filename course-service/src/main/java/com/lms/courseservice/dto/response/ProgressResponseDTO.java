package com.lms.courseservice.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class ProgressResponseDTO {
    private Long studentId;
    private Long courseId;
    private long completedModulesCount;
    private List<Long> completedModuleIds;
    private long totalModulesCount;
    private double progressPercentage;
    private boolean quizUnlocked;
    private boolean courseCompleted;
}
