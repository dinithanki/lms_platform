package com.lms.quizservice.service.impl;

import com.lms.quizservice.dto.response.QuizResultResponseDTO;
import com.lms.quizservice.mapper.AttemptMapper;
import com.lms.quizservice.repository.AttemptRepository;
import com.lms.quizservice.service.AttemptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AttemptServiceImpl implements AttemptService {

    @Autowired
    private AttemptRepository attemptRepository;

    @Autowired
    private AttemptMapper attemptMapper;

    @Override
    @Transactional(readOnly = true)
    public List<QuizResultResponseDTO> getAttemptsByStudentId(Long studentId) {
        return attemptRepository.findByStudentId(studentId).stream()
                .map(attemptMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizResultResponseDTO> getAttemptsByStudentIdAndQuizId(Long studentId, Long quizId) {
        return attemptRepository.findByStudentIdAndQuizId(studentId, quizId).stream()
                .map(attemptMapper::toResponseDTO)
                .collect(Collectors.toList());
    }
}
