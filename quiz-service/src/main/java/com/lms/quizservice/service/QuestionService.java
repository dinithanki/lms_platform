package com.lms.quizservice.service;

import com.lms.quizservice.dto.request.QuestionRequestDTO;
import com.lms.quizservice.dto.response.QuestionResponseDTO;
import java.util.List;

public interface QuestionService {
    QuestionResponseDTO addQuestion(QuestionRequestDTO dto);
    QuestionResponseDTO editQuestion(Long id, QuestionRequestDTO dto);
    void deleteQuestion(Long id);
    List<QuestionResponseDTO> getQuestionsByQuizId(Long quizId);
}
