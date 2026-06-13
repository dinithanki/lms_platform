package com.lms.courseservice.service.impl;

import com.lms.courseservice.dto.request.ModuleRequestDTO;
import com.lms.courseservice.dto.response.ModuleResponseDTO;
import com.lms.courseservice.dto.response.ProgressResponseDTO;
import com.lms.courseservice.entity.Course;
import com.lms.courseservice.entity.Module;
import com.lms.courseservice.entity.ModuleProgress;
import com.lms.courseservice.entity.QuizResult;
import com.lms.courseservice.exception.EnrollmentException;
import com.lms.courseservice.mapper.ModuleMapper;
import com.lms.courseservice.repository.EnrollmentRepository;
import com.lms.courseservice.repository.ModuleProgressRepository;
import com.lms.courseservice.repository.ModuleRepository;
import com.lms.courseservice.repository.QuizResultRepository;
import com.lms.courseservice.service.CourseService;
import com.lms.courseservice.service.ModuleService;
import com.lms.courseservice.util.ProgressCalculator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ModuleServiceImpl implements ModuleService {

    @Autowired
    private ModuleRepository moduleRepository;

    @Autowired
    private CourseService courseService;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private ModuleProgressRepository moduleProgressRepository;

    @Autowired
    private QuizResultRepository quizResultRepository;

    @Autowired
    private ModuleMapper moduleMapper;

    @Override
    @Transactional
    public ModuleResponseDTO createModule(Long courseId, ModuleRequestDTO dto) {
        Course course = courseService.getCourseEntityById(courseId);
        Module module = moduleMapper.toEntity(dto);
        module.setCourse(course);
        Module savedModule = moduleRepository.save(module);
        return moduleMapper.toResponseDTO(savedModule);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ModuleResponseDTO> getModulesByCourseId(Long courseId) {
        // Just verify if course exists
        courseService.getCourseEntityById(courseId);
        return moduleRepository.findByCourseId(courseId).stream()
                .map(moduleMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void completeModule(Long moduleId, Long studentId) {
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new IllegalArgumentException("Module with ID " + moduleId + " not found"));

        Long courseId = module.getCourse().getId();

        // Enforce enrollment check
        if (!enrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId)) {
            throw new EnrollmentException("Student must enroll in the course before completing modules.");
        }

        // Save progress
        Optional<ModuleProgress> existingProgress = moduleProgressRepository.findByStudentIdAndModuleId(studentId, moduleId);
        if (existingProgress.isPresent()) {
            ModuleProgress progress = existingProgress.get();
            if (!progress.isCompleted()) {
                progress.setCompleted(true);
                progress.setCompletedAt(LocalDateTime.now());
                moduleProgressRepository.save(progress);
            }
        } else {
            ModuleProgress progress = new ModuleProgress();
            progress.setStudentId(studentId);
            progress.setModuleId(moduleId);
            progress.setCompleted(true);
            progress.setCompletedAt(LocalDateTime.now());
            moduleProgressRepository.save(progress);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ProgressResponseDTO getCourseProgress(Long courseId, Long studentId) {
        // Verify course exists
        courseService.getCourseEntityById(courseId);

        // Verify enrollment exists
        if (!enrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId)) {
            throw new EnrollmentException("Student must enroll in the course to view progress.");
        }

        List<Module> modules = moduleRepository.findByCourseId(courseId);
        long totalModules = modules.size();

        long completedModules = 0;
        if (totalModules > 0) {
            List<Long> moduleIds = modules.stream().map(Module::getId).collect(Collectors.toList());
            completedModules = moduleProgressRepository.countByStudentIdAndModuleIdInAndCompletedTrue(studentId, moduleIds);
        }

        double progressPercentage = ProgressCalculator.calculatePercentage(completedModules, totalModules);
        boolean quizUnlocked = (completedModules == totalModules) && (totalModules > 0);

        // Check if quiz is passed (score >= 60% and attempts <= 5)
        boolean quizPassed = false;
        Optional<QuizResult> quizResultOpt = quizResultRepository.findByStudentIdAndCourseId(studentId, courseId);
        if (quizResultOpt.isPresent()) {
            QuizResult quizResult = quizResultOpt.get();
            if (quizResult.getScore() >= 60.0 && quizResult.getAttempts() <= 5) {
                quizPassed = true;
            }
        }

        boolean courseCompleted = quizUnlocked && quizPassed;

        ProgressResponseDTO dto = new ProgressResponseDTO();
        dto.setStudentId(studentId);
        dto.setCourseId(courseId);
        dto.setCompletedModulesCount(completedModules);
        dto.setTotalModulesCount(totalModules);
        dto.setProgressPercentage(progressPercentage);
        dto.setQuizUnlocked(quizUnlocked);
        dto.setCourseCompleted(courseCompleted);

        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean areAllModulesCompleted(Long courseId, Long studentId) {
        List<Module> modules = moduleRepository.findByCourseId(courseId);
        if (modules.isEmpty()) {
            return false;
        }
        List<Long> moduleIds = modules.stream().map(Module::getId).collect(Collectors.toList());
        long completedModules = moduleProgressRepository.countByStudentIdAndModuleIdInAndCompletedTrue(studentId, moduleIds);
        return completedModules == modules.size();
    }
}
