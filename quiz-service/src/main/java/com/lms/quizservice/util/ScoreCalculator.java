package com.lms.quizservice.util;

public class ScoreCalculator {

    public static double calculateScore(int correctAnswers, int totalQuestions) {
        if (totalQuestions <= 0) {
            return 0.0;
        }
        return ((double) correctAnswers / totalQuestions) * 100.0;
    }
}
