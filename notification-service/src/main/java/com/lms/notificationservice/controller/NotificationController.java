package com.lms.notificationservice.controller;

import com.lms.notificationservice.dto.*;
import com.lms.notificationservice.model.InAppNotification;
import com.lms.notificationservice.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notify")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @PostMapping("/in-app")
    public ResponseEntity<ApiResponse<InAppNotification>> createInAppNotification(@Valid @RequestBody InAppNotificationRequest request) {
        InAppNotification notification = notificationService.createInAppNotification(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "In-app notification created successfully", notification));
    }

    @GetMapping("/in-app")
    public ResponseEntity<ApiResponse<List<InAppNotification>>> getInAppNotifications(
            @RequestHeader(value = "X-User-Name", required = false) String email) {
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "X-User-Name header is missing"));
        }
        List<InAppNotification> notifications = notificationService.getInAppNotifications(email);
        return ResponseEntity.ok(new ApiResponse<>(true, "Notifications retrieved successfully", notifications));
    }

    @GetMapping("/in-app/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(
            @RequestHeader(value = "X-User-Name", required = false) String email) {
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "X-User-Name header is missing"));
        }
        long count = notificationService.getUnreadCount(email);
        return ResponseEntity.ok(new ApiResponse<>(true, "Unread count retrieved successfully", count));
    }

    @PutMapping("/in-app/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Name", required = false) String email) {
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "X-User-Name header is missing"));
        }
        notificationService.markAsRead(id, email);
        return ResponseEntity.ok(new ApiResponse<>(true, "Notification marked as read"));
    }

    @PutMapping("/in-app/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            @RequestHeader(value = "X-User-Name", required = false) String email) {
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "X-User-Name header is missing"));
        }
        notificationService.markAllAsRead(email);
        return ResponseEntity.ok(new ApiResponse<>(true, "All notifications marked as read"));
    }
}
