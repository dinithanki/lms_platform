package com.lms.courseservice.exception;

public class CourseAccessDeniedException extends RuntimeException {
    public CourseAccessDeniedException(String message) {
        super(message);
    }
}