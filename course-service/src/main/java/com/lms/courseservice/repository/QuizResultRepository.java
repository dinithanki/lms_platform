package com.lms.courseservice.repository;

import com.lms.courseservice.entity.QuizResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface QuizResultRepository extends JpaRepository<QuizResult, Long> {
    Optional<QuizResult> findByStudentIdAndCourseId(Long studentId, Long courseId);
}
