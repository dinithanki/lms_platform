package com.lms.quizservice.service.impl;

import com.lms.quizservice.client.CourseClient;
import com.lms.quizservice.dto.request.QuizRequestDTO;
import com.lms.quizservice.dto.request.SubmitQuizRequestDTO;
import com.lms.quizservice.dto.request.SubmitQuizRequestDTO.SubmittedAnswerDTO;
import com.lms.quizservice.dto.response.ProgressResponseDTO;
import com.lms.quizservice.dto.response.QuizResponseDTO;
import com.lms.quizservice.dto.response.QuizResultResponseDTO;
import com.lms.quizservice.entity.Question;
import com.lms.quizservice.entity.Quiz;
import com.lms.quizservice.entity.QuizAttempt;
import com.lms.quizservice.exception.AttemptLimitException;
import com.lms.quizservice.exception.QuizNotFoundException;
import com.lms.quizservice.mapper.AttemptMapper;
import com.lms.quizservice.mapper.QuizMapper;
import com.lms.quizservice.repository.AttemptRepository;
import com.lms.quizservice.repository.QuizRepository;
import com.lms.quizservice.service.QuizService;
import com.lms.quizservice.util.ScoreCalculator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class QuizServiceImpl implements QuizService {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private AttemptRepository attemptRepository;

    @Autowired
    private QuizMapper quizMapper;

    @Autowired
    private AttemptMapper attemptMapper;

    @Autowired
    private CourseClient courseClient;

    @Override
    @Transactional
    public QuizResponseDTO createQuiz(QuizRequestDTO dto) {
        if (quizRepository.existsByCourseId(dto.getCourseId())) {
            throw new IllegalStateException("A quiz already exists for course ID " + dto.getCourseId());
        }
        Quiz quiz = quizMapper.toEntity(dto);
        Quiz savedQuiz = quizRepository.save(quiz);
        return quizMapper.toResponseDTO(savedQuiz);
    }

    @Override
    @Transactional
    public QuizResponseDTO updateQuiz(Long id, QuizRequestDTO dto) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new QuizNotFoundException("Quiz with ID " + id + " not found"));
        
        // Ensure that courseId can't be changed to one that already has a quiz (unless it's the same course)
        if (!quiz.getCourseId().equals(dto.getCourseId()) && quizRepository.existsByCourseId(dto.getCourseId())) {
            throw new IllegalStateException("A quiz already exists for course ID " + dto.getCourseId());
        }

        quiz.setCourseId(dto.getCourseId());
        quiz.setTitle(dto.getTitle());
        quiz.setDescription(dto.getDescription());
        quiz.setPublished(dto.isPublished());
        
        Quiz savedQuiz = quizRepository.save(quiz);
        return quizMapper.toResponseDTO(savedQuiz);
    }

    @Override
    @Transactional
    public void deleteQuiz(Long id) {
        if (!quizRepository.existsById(id)) {
            throw new QuizNotFoundException("Quiz with ID " + id + " not found");
        }
        quizRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public QuizResponseDTO getQuizByCourseId(Long courseId, Long studentId) {
        Quiz quiz = quizRepository.findByCourseId(courseId)
                .orElseThrow(() -> new QuizNotFoundException("Quiz for course ID " + courseId + " not found"));

        // If student ID is provided, enforce access rules
        if (studentId != null) {
            // 1. Verify quiz is published
            if (!quiz.isPublished()) {
                throw new IllegalStateException("Quiz is not published yet.");
            }

            // 2. Verify student progress/unlock status from Course Service
            ProgressResponseDTO progress = courseClient.getCourseProgress(courseId, studentId);
            if (progress == null || !progress.isQuizUnlocked()) {
                throw new IllegalStateException("Quiz is locked. Student must complete all modules before attempting the quiz.");
            }

            // 3. Map to DTO and mask correct answers for safety
            QuizResponseDTO dto = quizMapper.toResponseDTO(quiz);
            if (dto.getQuestions() != null) {
                dto.getQuestions().forEach(q -> q.setCorrectAnswer(null));
            }
            return dto;
        }

        // Admin flow - return unmodified DTO
        return quizMapper.toResponseDTO(quiz);
    }

    @Override
    @Transactional(readOnly = true)
    public QuizResponseDTO getQuizById(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new QuizNotFoundException("Quiz with ID " + id + " not found"));
        return quizMapper.toResponseDTO(quiz);
    }

    @Override
    @Transactional
    public QuizResponseDTO publishQuiz(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new QuizNotFoundException("Quiz with ID " + id + " not found"));
        quiz.setPublished(true);
        Quiz savedQuiz = quizRepository.save(quiz);
        return quizMapper.toResponseDTO(savedQuiz);
    }

    @Override
    @Transactional
    public QuizResultResponseDTO submitQuiz(SubmitQuizRequestDTO request) {
        Quiz quiz = quizRepository.findById(request.getQuizId())
                .orElseThrow(() -> new QuizNotFoundException("Quiz with ID " + request.getQuizId() + " not found"));

        if (!quiz.isPublished()) {
            throw new IllegalStateException("Cannot submit to an unpublished quiz.");
        }

        // 1. Check attempt limit (max 5)
        long currentAttemptCount = attemptRepository.countByStudentIdAndQuizId(request.getStudentId(), quiz.getId());
        if (currentAttemptCount >= 5) {
            throw new AttemptLimitException("Maximum limit of 5 quiz attempts reached.");
        }

        // 2. Validate course completion status via Course Service
        ProgressResponseDTO progress = courseClient.getCourseProgress(quiz.getCourseId(), request.getStudentId());
        if (progress == null || !progress.isQuizUnlocked()) {
            throw new IllegalStateException("Quiz is locked. Student must complete all modules before attempting the quiz.");
        }

        // 3. Calculate score
        List<Question> questions = quiz.getQuestions();
        if (questions.isEmpty()) {
            throw new IllegalStateException("Quiz does not contain any questions.");
        }

        Map<Long, Question> questionMap = questions.stream()
                .collect(Collectors.toMap(Question::getId, Function.identity()));

        int correctAnswersCount = 0;
        for (SubmittedAnswerDTO submitted : request.getAnswers()) {
            Question question = questionMap.get(submitted.getQuestionId());
            if (question != null && question.getCorrectAnswer().trim().equalsIgnoreCase(submitted.getSelectedOption().trim())) {
                correctAnswersCount++;
            }
        }

        double score = ScoreCalculator.calculateScore(correctAnswersCount, questions.size());
        int attemptNum = (int) currentAttemptCount + 1;
        String passStatus = (score >= 60.0) ? "PASS" : "FAIL";

        // 4. Save attempt in local Database
        QuizAttempt attempt = new QuizAttempt();
        attempt.setQuizId(quiz.getId());
        attempt.setStudentId(request.getStudentId());
        attempt.setScore(score);
        attempt.setAttemptNumber(attemptNum);
        attempt.setPassStatus(passStatus);
        attempt.setAttemptTime(LocalDateTime.now());
        
        QuizAttempt savedAttempt = attemptRepository.save(attempt);

        // 5. Send result to Course Service
        courseClient.submitQuizResult(quiz.getCourseId(), request.getStudentId(), score);

        return attemptMapper.toResponseDTO(savedAttempt);
    }
}
