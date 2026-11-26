package com.lms.quizservice.controller;

import com.lms.quizservice.dto.request.QuestionRequestDTO;
import com.lms.quizservice.dto.response.QuestionResponseDTO;
import com.lms.quizservice.service.QuestionService;
import com.lms.quizservice.service.QuizService;
import com.lms.quizservice.security.LmsPrincipal;
import com.lms.quizservice.client.CourseClient;
import com.lms.quizservice.dto.response.QuizResponseDTO;
import com.lms.quizservice.dto.response.ProgressResponseDTO;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/questions")
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    @Autowired
    private QuizService quizService;

    @Autowired
    private CourseClient courseClient;

    @PostMapping
    public ResponseEntity<QuestionResponseDTO> addQuestion(
            @Valid @RequestBody QuestionRequestDTO dto,
            @AuthenticationPrincipal LmsPrincipal principal) {
        quizService.requireQuizManagementAccess(dto.getQuizId(), principal);
        QuestionResponseDTO response = questionService.addQuestion(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuestionResponseDTO> editQuestion(
            @PathVariable Long id,
            @Valid @RequestBody QuestionRequestDTO dto,
            @AuthenticationPrincipal LmsPrincipal principal) {
        Long currentQuizId = questionService.getQuizIdByQuestionId(id);
        quizService.requireQuizManagementAccess(currentQuizId, principal);
        quizService.requireQuizManagementAccess(dto.getQuizId(), principal);
        QuestionResponseDTO response = questionService.editQuestion(id, dto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(
            @PathVariable Long id,
            @AuthenticationPrincipal LmsPrincipal principal) {
        quizService.requireQuizManagementAccess(questionService.getQuizIdByQuestionId(id), principal);
        questionService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<List<QuestionResponseDTO>> getQuestionsByQuizId(
            @PathVariable Long quizId, @AuthenticationPrincipal LmsPrincipal principal) {
        if ("INSTRUCTOR".equals(principal.role())) {
            quizService.requireQuizManagementAccess(quizId, principal);
        } else if ("STUDENT".equals(principal.role())) {
            QuizResponseDTO quiz = quizService.getQuizById(quizId);
            if (!quiz.isPublished()) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Quiz is not published");
            ProgressResponseDTO progress = courseClient.getCourseProgress(quiz.getCourseId(), principal.id());
            if (progress == null || !progress.isQuizUnlocked()) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Quiz is locked");
            }
        }
        List<QuestionResponseDTO> response = questionService.getQuestionsByQuizId(quizId);
        if ("STUDENT".equals(principal.role())) response.forEach(question -> question.setCorrectAnswer(null));
        return ResponseEntity.ok(response);
    }
}
