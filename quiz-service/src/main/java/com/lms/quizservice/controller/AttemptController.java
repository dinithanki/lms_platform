package com.lms.quizservice.controller;

import com.lms.quizservice.dto.response.QuizResultResponseDTO;
import com.lms.quizservice.service.AttemptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/quizzes/result")
public class AttemptController {

    @Autowired
    private AttemptService attemptService;

    @GetMapping("/{studentId}")
    public ResponseEntity<List<QuizResultResponseDTO>> getQuizResults(
            @PathVariable Long studentId,
            @RequestParam(required = false) Long quizId) {
        
        List<QuizResultResponseDTO> response;
        if (quizId != null) {
            response = attemptService.getAttemptsByStudentIdAndQuizId(studentId, quizId);
        } else {
            response = attemptService.getAttemptsByStudentId(studentId);
        }
        return ResponseEntity.ok(response);
    }
}
