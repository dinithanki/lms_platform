package com.lms.courseservice.controller;

import com.lms.courseservice.entity.QuizResult;
import com.lms.courseservice.exception.EnrollmentException;
import com.lms.courseservice.repository.EnrollmentRepository;
import com.lms.courseservice.repository.QuizResultRepository;
import com.lms.courseservice.service.ModuleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/courses")
public class QuizResultController {

    @Autowired
    private QuizResultRepository quizResultRepository;

    @Autowired
    private ModuleService moduleService;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @PostMapping("/{id}/quiz")
    @Transactional
    public ResponseEntity<QuizResult> submitQuizResult(
            @PathVariable Long id,
            @RequestParam Long studentId,
            @RequestParam double score) {

        // 1. Verify student is enrolled in the course
        if (!enrollmentRepository.existsByStudentIdAndCourseId(studentId, id)) {
            throw new EnrollmentException("Student must enroll in the course before attempting the quiz.");
        }

        // 2. Verify all modules are completed (Quiz unlocked condition)
        boolean allCompleted = moduleService.areAllModulesCompleted(id, studentId);
        if (!allCompleted) {
            throw new IllegalStateException("Quiz is locked. Student must complete all modules before attempting the quiz.");
        }

        // 3. Process quiz result and attempts limit
        QuizResult result;
        Optional<QuizResult> existingResultOpt = quizResultRepository.findByStudentIdAndCourseId(studentId, id);

        if (existingResultOpt.isPresent()) {
            result = existingResultOpt.get();
            if (result.getAttempts() >= 5) {
                throw new IllegalStateException("Maximum limit of 5 quiz attempts reached.");
            }
            result.setAttempts(result.getAttempts() + 1);
            // Overwrite with the latest attempt score or update to the latest
            result.setScore(score);
        } else {
            result = new QuizResult();
            result.setStudentId(studentId);
            result.setCourseId(id);
            result.setAttempts(1);
            result.setScore(score);
        }

        QuizResult savedResult = quizResultRepository.save(result);
        return ResponseEntity.ok(savedResult);
    }
}
