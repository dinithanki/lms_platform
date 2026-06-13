package com.lms.notificationservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InAppNotificationRequest {

    @NotBlank(message = "Recipient is required")
    private String recipient; // user email or "ALL" for broadcast

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Message is required")
    private String message;

    private String type; // e.g., COURSE_ENROLLMENT, GUIDELINE, UPDATE
}
