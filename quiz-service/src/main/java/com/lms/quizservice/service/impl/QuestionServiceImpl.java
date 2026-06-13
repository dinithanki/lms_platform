package com.lms.quizservice.service.impl;

import com.lms.quizservice.dto.request.QuestionRequestDTO;
import com.lms.quizservice.dto.response.QuestionResponseDTO;
import com.lms.quizservice.entity.Question;
import com.lms.quizservice.entity.Quiz;
import com.lms.quizservice.exception.QuizNotFoundException;
import com.lms.quizservice.mapper.QuestionMapper;
import com.lms.quizservice.repository.QuestionRepository;
import com.lms.quizservice.repository.QuizRepository;
import com.lms.quizservice.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuestionServiceImpl implements QuestionService {

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuestionMapper questionMapper;

    @Override
    @Transactional
    public QuestionResponseDTO addQuestion(QuestionRequestDTO dto) {
        Quiz quiz = quizRepository.findById(dto.getQuizId())
                .orElseThrow(() -> new QuizNotFoundException("Quiz with ID " + dto.getQuizId() + " not found"));

        Question question = questionMapper.toEntity(dto);
        question.setQuiz(quiz);

        Question saved = questionRepository.save(question);
        return questionMapper.toResponseDTO(saved);
    }

    @Override
    @Transactional
    public QuestionResponseDTO editQuestion(Long id, QuestionRequestDTO dto) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Question with ID " + id + " not found"));

        Quiz quiz = quizRepository.findById(dto.getQuizId())
                .orElseThrow(() -> new QuizNotFoundException("Quiz with ID " + dto.getQuizId() + " not found"));

        question.setQuiz(quiz);
        question.setQuestionText(dto.getQuestionText());
        question.setOptionA(dto.getOptionA());
        question.setOptionB(dto.getOptionB());
        question.setOptionC(dto.getOptionC());
        question.setOptionD(dto.getOptionD());
        question.setCorrectAnswer(dto.getCorrectAnswer());

        Question saved = questionRepository.save(question);
        return questionMapper.toResponseDTO(saved);
    }

    @Override
    @Transactional
    public void deleteQuestion(Long id) {
        if (!questionRepository.existsById(id)) {
            throw new IllegalArgumentException("Question with ID " + id + " not found");
        }
        questionRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuestionResponseDTO> getQuestionsByQuizId(Long quizId) {
        if (!quizRepository.existsById(quizId)) {
            throw new QuizNotFoundException("Quiz with ID " + quizId + " not found");
        }
        return questionRepository.findByQuizId(quizId).stream()
                .map(questionMapper::toResponseDTO)
                .collect(Collectors.toList());
    }
}
