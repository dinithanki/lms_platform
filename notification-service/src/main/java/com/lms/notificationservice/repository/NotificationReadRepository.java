package com.lms.notificationservice.repository;

import com.lms.notificationservice.model.NotificationRead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationReadRepository extends JpaRepository<NotificationRead, Long> {
    boolean existsByUserEmailAndNotificationId(String userEmail, Long notificationId);
    Optional<NotificationRead> findByUserEmailAndNotificationId(String userEmail, Long notificationId);
}
