package com.lms.quizservice.exception;

public class AttemptLimitException extends RuntimeException {
    public AttemptLimitException(String message) {
        super(message);
    }
}
