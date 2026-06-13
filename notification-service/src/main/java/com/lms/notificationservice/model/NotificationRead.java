package com.lms.notificationservice.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "notification_reads")
public class NotificationRead {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_email", nullable = false)
    private String userEmail;

    @Column(name = "notification_id", nullable = false)
    private Long notificationId;

    public NotificationRead(String userEmail, Long notificationId) {
        this.userEmail = userEmail;
        this.notificationId = notificationId;
    }
}
