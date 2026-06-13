package com.lms.quizservice.repository;

import com.lms.quizservice.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findByStudentId(Long studentId);
    List<QuizAttempt> findByStudentIdAndQuizId(Long studentId, Long quizId);
    long countByStudentIdAndQuizId(Long studentId, Long quizId);
}
