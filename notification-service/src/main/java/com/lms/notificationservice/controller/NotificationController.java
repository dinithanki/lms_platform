package com.lms.notificationservice.controller;

import com.lms.notificationservice.dto.ApiResponse;
import com.lms.notificationservice.dto.EmailRequest;
import com.lms.notificationservice.dto.OtpEmailRequest;
import com.lms.notificationservice.dto.ResetPasswordEmailRequest;
import com.lms.notificationservice.service.EmailService;
import com.lms.notificationservice.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notify")
public class NotificationController {

    @Autowired
    private EmailService emailService;

    @Autowired
    private NotificationService notificationService;

    @PostMapping("/email")
    public ResponseEntity<ApiResponse<Void>> sendEmail(@Valid @RequestBody EmailRequest request) {
        emailService.sendHtmlEmail(request.getTo(), request.getSubject(), request.getMessage());
        return ResponseEntity.ok(new ApiResponse<>(true, "Email sent successfully"));
    }

    @PostMapping("/otp")
    public ResponseEntity<ApiResponse<Void>> sendOtp(@Valid @RequestBody OtpEmailRequest request) {
        notificationService.sendOtpEmail(request.getTo(), request.getOtp());
        return ResponseEntity.ok(new ApiResponse<>(true, "OTP email sent successfully"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> sendResetPassword(@Valid @RequestBody ResetPasswordEmailRequest request) {
        notificationService.sendResetPasswordEmail(request.getTo(), request.getResetLink());
        return ResponseEntity.ok(new ApiResponse<>(true, "Password reset email sent successfully"));
    }
}
