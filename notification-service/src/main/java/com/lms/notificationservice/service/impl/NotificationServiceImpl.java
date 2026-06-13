package com.lms.notificationservice.service.impl;

import com.lms.notificationservice.service.EmailService;
import com.lms.notificationservice.service.NotificationService;
import com.lms.notificationservice.service.template.EmailTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private EmailService emailService;

    @Autowired
    private EmailTemplateService templateService;

    @Override
    public void sendWelcomeEmail(String to, String name) {
        String htmlContent = templateService.buildWelcomeEmail(name);
        emailService.sendHtmlEmail(to, "Welcome to LMS Platform", htmlContent);
    }

    @Override
    public void sendOtpEmail(String to, String otp) {
        String htmlContent = templateService.buildOtpEmail(otp);
        emailService.sendHtmlEmail(to, "Your Verification Code - LMS Platform", htmlContent);
    }

    @Override
    public void sendResetPasswordEmail(String to, String resetLink) {
        String htmlContent = templateService.buildResetPasswordEmail(resetLink);
        emailService.sendHtmlEmail(to, "Reset Your Password - LMS Platform", htmlContent);
    }
}
