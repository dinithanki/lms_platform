package com.lms.quizservice.mapper;

import com.lms.quizservice.dto.request.QuestionRequestDTO;
import com.lms.quizservice.dto.response.QuestionResponseDTO;
import com.lms.quizservice.entity.Question;
import org.springframework.stereotype.Component;

@Component
public class QuestionMapper {

    public Question toEntity(QuestionRequestDTO dto) {
        if (dto == null) {
            return null;
        }
        Question question = new Question();
        question.setQuestionText(dto.getQuestionText());
        question.setOptionA(dto.getOptionA());
        question.setOptionB(dto.getOptionB());
        question.setOptionC(dto.getOptionC());
        question.setOptionD(dto.getOptionD());
        question.setCorrectAnswer(dto.getCorrectAnswer());
        return question;
    }

    public QuestionResponseDTO toResponseDTO(Question question) {
        if (question == null) {
            return null;
        }
        QuestionResponseDTO dto = new QuestionResponseDTO();
        dto.setId(question.getId());
        if (question.getQuiz() != null) {
            dto.setQuizId(question.getQuiz().getId());
        }
        dto.setQuestionText(question.getQuestionText());
        dto.setOptionA(question.getOptionA());
        dto.setOptionB(question.getOptionB());
        dto.setOptionC(question.getOptionC());
        dto.setOptionD(question.getOptionD());
        dto.setCorrectAnswer(question.getCorrectAnswer());
        return dto;
    }
}
