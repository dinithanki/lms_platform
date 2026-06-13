package com.lms.notificationservice.service;

public interface EmailService {
    void sendHtmlEmail(String to, String subject, String htmlContent);
}
