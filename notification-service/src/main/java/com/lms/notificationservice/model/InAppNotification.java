package com.lms.notificationservice.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "in_app_notifications")
public class InAppNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String recipient; // user email or "ALL" for broadcast

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1000)
    private String message;

    @Column(nullable = false)
    private String type; // e.g., COURSE_ENROLLMENT, GUIDELINE, UPDATE

    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
