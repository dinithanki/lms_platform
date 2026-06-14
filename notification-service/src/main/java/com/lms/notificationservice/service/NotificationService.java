package com.lms.notificationservice.service;

import com.lms.notificationservice.dto.InAppNotificationRequest;
import com.lms.notificationservice.model.InAppNotification;
import java.util.List;

public interface NotificationService {
    InAppNotification createInAppNotification(InAppNotificationRequest request);

    List<InAppNotification> getInAppNotifications(String email);

    long getUnreadCount(String email);

    void markAsRead(Long id, String email);

    void markAllAsRead(String email);
}
