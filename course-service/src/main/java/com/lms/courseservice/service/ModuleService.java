package com.lms.courseservice.service;

import com.lms.courseservice.dto.request.ModuleRequestDTO;
import com.lms.courseservice.dto.response.ModuleResponseDTO;
import com.lms.courseservice.dto.response.ProgressResponseDTO;
import java.util.List;

public interface ModuleService {
    ModuleResponseDTO createModule(Long courseId, ModuleRequestDTO dto);
    List<ModuleResponseDTO> getModulesByCourseId(Long courseId);
    void completeModule(Long moduleId, Long studentId);
    ProgressResponseDTO getCourseProgress(Long courseId, Long studentId);
    boolean areAllModulesCompleted(Long courseId, Long studentId);
}
