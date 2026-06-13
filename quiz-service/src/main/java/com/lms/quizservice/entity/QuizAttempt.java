package com.lms.quizservice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "quiz_attempts")
public class QuizAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "quiz_id", nullable = false)
    private Long quizId;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(nullable = false)
    private double score;

    @Column(name = "attempt_number", nullable = false)
    private int attemptNumber;

    @Column(name = "pass_status", nullable = false)
    private String passStatus; // "PASS" or "FAIL"

    @Column(name = "attempt_time", nullable = false)
    private LocalDateTime attemptTime;
}
