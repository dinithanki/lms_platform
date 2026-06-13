package com.lms.notificationservice.repository;

import com.lms.notificationservice.model.InAppNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InAppNotificationRepository extends JpaRepository<InAppNotification, Long> {

    @Query("SELECT n FROM InAppNotification n WHERE n.recipient = :email OR n.recipient = 'ALL' ORDER BY n.createdAt DESC")
    List<InAppNotification> findAllByRecipientOrBroadcast(@Param("email") String email);

    @Query("SELECT count(n) FROM InAppNotification n WHERE (n.recipient = :email AND n.isRead = false) OR (n.recipient = 'ALL' AND n.id NOT IN (SELECT r.notificationId FROM NotificationRead r WHERE r.userEmail = :email))")
    long countUnreadNotifications(@Param("email") String email);
}
