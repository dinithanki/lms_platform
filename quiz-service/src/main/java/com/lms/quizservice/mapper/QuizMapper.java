package com.lms.quizservice.mapper;

import com.lms.quizservice.dto.request.QuizRequestDTO;
import com.lms.quizservice.dto.response.QuizResponseDTO;
import com.lms.quizservice.entity.Quiz;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.stream.Collectors;

@Component
public class QuizMapper {

    @Autowired
    private QuestionMapper questionMapper;

    public Quiz toEntity(QuizRequestDTO dto) {
        if (dto == null) {
            return null;
        }
        Quiz quiz = new Quiz();
        quiz.setCourseId(dto.getCourseId());
        quiz.setTitle(dto.getTitle());
        quiz.setDescription(dto.getDescription());
        quiz.setPublished(dto.isPublished());
        return quiz;
    }

    public QuizResponseDTO toResponseDTO(Quiz quiz) {
        if (quiz == null) {
            return null;
        }
        QuizResponseDTO dto = new QuizResponseDTO();
        dto.setId(quiz.getId());
        dto.setCourseId(quiz.getCourseId());
        dto.setTitle(quiz.getTitle());
        dto.setDescription(quiz.getDescription());
        dto.setPublished(quiz.isPublished());
        if (quiz.getQuestions() != null) {
            dto.setQuestions(quiz.getQuestions().stream()
                    .map(questionMapper::toResponseDTO)
                    .collect(Collectors.toList()));
        }
        return dto;
    }
}
