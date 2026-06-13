package com.lms.quizservice.controller;

import com.lms.quizservice.dto.request.QuestionRequestDTO;
import com.lms.quizservice.dto.response.QuestionResponseDTO;
import com.lms.quizservice.service.QuestionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/questions")
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    @PostMapping
    public ResponseEntity<QuestionResponseDTO> addQuestion(@Valid @RequestBody QuestionRequestDTO dto) {
        QuestionResponseDTO response = questionService.addQuestion(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuestionResponseDTO> editQuestion(
            @PathVariable Long id,
            @Valid @RequestBody QuestionRequestDTO dto) {
        QuestionResponseDTO response = questionService.editQuestion(id, dto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<List<QuestionResponseDTO>> getQuestionsByQuizId(@PathVariable Long quizId) {
        List<QuestionResponseDTO> response = questionService.getQuestionsByQuizId(quizId);
        return ResponseEntity.ok(response);
    }
}
