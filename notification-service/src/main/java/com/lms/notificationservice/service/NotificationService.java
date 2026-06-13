package com.lms.notificationservice.service;

public interface NotificationService {
    void sendWelcomeEmail(String to, String name);
    void sendOtpEmail(String to, String otp);
    void sendResetPasswordEmail(String to, String resetLink);
}
