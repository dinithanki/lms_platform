package com.lms.notificationservice.service.impl;

import com.lms.notificationservice.dto.InAppNotificationRequest;
import com.lms.notificationservice.model.InAppNotification;
import com.lms.notificationservice.model.NotificationRead;
import com.lms.notificationservice.repository.InAppNotificationRepository;
import com.lms.notificationservice.repository.NotificationReadRepository;
import com.lms.notificationservice.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private InAppNotificationRepository inAppNotificationRepository;

    @Autowired
    private NotificationReadRepository notificationReadRepository;

    @Override
    public InAppNotification createInAppNotification(InAppNotificationRequest request) {
        InAppNotification notification = new InAppNotification();
        notification.setRecipient(request.getRecipient());
        notification.setTitle(request.getTitle());
        notification.setMessage(request.getMessage());
        notification.setType(request.getType() != null ? request.getType() : "GENERAL");
        return inAppNotificationRepository.save(notification);
    }

    @Override
    public List<InAppNotification> getInAppNotifications(String email) {
        List<InAppNotification> notifications = inAppNotificationRepository.findAllByRecipientOrBroadcast(email);
        for (InAppNotification notif : notifications) {
            if ("ALL".equalsIgnoreCase(notif.getRecipient())) {
                boolean read = notificationReadRepository.existsByUserEmailAndNotificationId(email, notif.getId());
                notif.setRead(read);
            }
        }
        return notifications;
    }

    @Override
    public long getUnreadCount(String email) {
        return inAppNotificationRepository.countUnreadNotifications(email);
    }

    @Override
    public void markAsRead(Long id, String email) {
        InAppNotification notification = inAppNotificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));

        if ("ALL".equalsIgnoreCase(notification.getRecipient())) {
            if (!notificationReadRepository.existsByUserEmailAndNotificationId(email, id)) {
                notificationReadRepository.save(new NotificationRead(email, id));
            }
        } else {
            if (notification.getRecipient().equalsIgnoreCase(email)) {
                notification.setRead(true);
                inAppNotificationRepository.save(notification);
            }
        }
    }

    @Override
    @Transactional
    public void markAllAsRead(String email) {
        List<InAppNotification> notifications = inAppNotificationRepository.findAllByRecipientOrBroadcast(email);
        for (InAppNotification notif : notifications) {
            if ("ALL".equalsIgnoreCase(notif.getRecipient())) {
                if (!notificationReadRepository.existsByUserEmailAndNotificationId(email, notif.getId())) {
                    notificationReadRepository.save(new NotificationRead(email, notif.getId()));
                }
            } else {
                if (!notif.isRead() && notif.getRecipient().equalsIgnoreCase(email)) {
                    notif.setRead(true);
                    inAppNotificationRepository.save(notif);
                }
            }
        }
    }
}
