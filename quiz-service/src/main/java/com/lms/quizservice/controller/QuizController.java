package com.lms.quizservice.controller;

import com.lms.quizservice.dto.request.QuizRequestDTO;
import com.lms.quizservice.dto.request.SubmitQuizRequestDTO;
import com.lms.quizservice.dto.response.QuizResponseDTO;
import com.lms.quizservice.dto.response.QuizResultResponseDTO;
import com.lms.quizservice.service.QuizService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/quizzes")
public class QuizController {

    @Autowired
    private QuizService quizService;

    @PostMapping
    public ResponseEntity<QuizResponseDTO> createQuiz(@Valid @RequestBody QuizRequestDTO dto) {
        QuizResponseDTO response = quizService.createQuiz(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuizResponseDTO> updateQuiz(@PathVariable Long id, @Valid @RequestBody QuizRequestDTO dto) {
        QuizResponseDTO response = quizService.updateQuiz(id, dto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long id) {
        quizService.deleteQuiz(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuizResponseDTO> getQuizById(@PathVariable Long id) {
        QuizResponseDTO response = quizService.getQuizById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<QuizResponseDTO> getQuizByCourseId(
            @PathVariable Long courseId,
            @RequestParam(required = false) Long studentId) {
        QuizResponseDTO response = quizService.getQuizByCourseId(courseId, studentId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<QuizResponseDTO> publishQuiz(@PathVariable Long id) {
        QuizResponseDTO response = quizService.publishQuiz(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/submit")
    public ResponseEntity<QuizResultResponseDTO> submitQuiz(@Valid @RequestBody SubmitQuizRequestDTO request) {
        QuizResultResponseDTO response = quizService.submitQuiz(request);
        return ResponseEntity.ok(response);
    }
}
