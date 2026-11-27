package com.lms.userservice.entity;

import com.lms.userservice.dto.event.StudentEnrolledEvent;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "user_activities", indexes = {
        @Index(name = "user_activities_user_occurred_idx", columnList = "user_id, occurred_at")
})
public class UserActivity {

    @Id
    @Column(name = "event_id", nullable = false, updatable = false)
    private UUID eventId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "event_type", nullable = false, length = 100)
    private String eventType;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    @Column(name = "enrollment_id", nullable = false)
    private Long enrollmentId;

    @Column(name = "occurred_at", nullable = false)
    private LocalDateTime occurredAt;

    public static UserActivity from(StudentEnrolledEvent event) {
        UserActivity activity = new UserActivity();
        activity.eventId = event.eventId();
        activity.userId = event.studentId();
        activity.eventType = event.eventType();
        activity.courseId = event.courseId();
        activity.enrollmentId = event.enrollmentId();
        activity.occurredAt = event.occurredAt();
        return activity;
    }
}
