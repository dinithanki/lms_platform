package com.lms.courseservice.service;

import com.lms.courseservice.dto.request.ModuleRequestDTO;
import com.lms.courseservice.dto.response.ModuleResponseDTO;
import com.lms.courseservice.dto.response.ProgressResponseDTO;
import java.util.List;

public interface ModuleService {
    ModuleResponseDTO createModule(Long courseId, ModuleRequestDTO dto);
    ModuleResponseDTO createModule(Long courseId, ModuleRequestDTO dto, String username, String role);
    List<ModuleResponseDTO> getModulesByCourseId(Long courseId);
    List<ModuleResponseDTO> getModulesByCourseId(Long courseId, String username, String role);
    void completeModule(Long moduleId, Long studentId);
    ProgressResponseDTO getCourseProgress(Long courseId, Long studentId);
    ProgressResponseDTO getCourseProgress(Long courseId, Long studentId, String username, String role);
    boolean areAllModulesCompleted(Long courseId, Long studentId);
}
