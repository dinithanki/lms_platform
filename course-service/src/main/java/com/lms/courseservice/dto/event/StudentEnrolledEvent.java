package com.lms.courseservice.dto.event;

import java.time.LocalDateTime;
import java.util.UUID;

public record StudentEnrolledEvent(
        UUID eventId,
        String eventType,
        LocalDateTime occurredAt,
        Long enrollmentId,
        Long studentId,
        Long courseId,
        LocalDateTime enrolledAt) {
}
