package com.lms.notificationservice.service.impl;

import com.lms.notificationservice.client.BrevoClient;
import com.lms.notificationservice.config.BrevoConfig;
import com.lms.notificationservice.exception.EmailSendException;
import com.lms.notificationservice.model.NotificationLog;
import com.lms.notificationservice.repository.NotificationLogRepository;
import com.lms.notificationservice.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class EmailServiceImpl implements EmailService {

    @Autowired
    private BrevoClient brevoClient;

    @Autowired
    private BrevoConfig brevoConfig;

    @Autowired
    private NotificationLogRepository logRepository;

    @Override
    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        log.info("Preparing to send email to: {} with subject: '{}'", to, subject);

        NotificationLog notificationLog = new NotificationLog();
        notificationLog.setRecipient(to);
        notificationLog.setSubject(subject);
        notificationLog.setSentAt(LocalDateTime.now());

        String apiKey = brevoConfig.getApiKey();
        if (apiKey == null || apiKey.trim().isEmpty() || "mock".equalsIgnoreCase(apiKey.trim())) {
            log.info("-----------------[ MOCK EMAIL DELIVERY ]-----------------");
            log.info("Recipient: {}", to);
            log.info("Sender Name: {}", brevoConfig.getSenderName());
            log.info("Sender Email: {}", brevoConfig.getSenderEmail());
            log.info("Subject: {}", subject);
            log.info("Content Preview:\n{}", htmlContent);
            log.info("---------------------------------------------------------");

            notificationLog.setStatus("SUCCESS");
            logRepository.save(notificationLog);
            return;
        }

        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("sender", Map.of(
                    "name", brevoConfig.getSenderName(),
                    "email", brevoConfig.getSenderEmail()
            ));
            requestBody.put("to", List.of(Map.of("email", to)));
            requestBody.put("subject", subject);
            requestBody.put("htmlContent", htmlContent);

            brevoClient.sendEmail(apiKey, requestBody);
            log.info("Email sent successfully to {} via Brevo", to);

            notificationLog.setStatus("SUCCESS");
            logRepository.save(notificationLog);

        } catch (feign.FeignException e) {
            String responseBody = e.contentUTF8();
            log.error("Failed to send email to {} via Brevo. Status: {}, Response: {}", to, e.status(), responseBody, e);

            notificationLog.setStatus("FAILED");
            notificationLog.setErrorMessage("Status: " + e.status() + ", Response: " + responseBody);
            logRepository.save(notificationLog);

            throw new EmailSendException("Failed to send email via Brevo: " + responseBody, e);
        } catch (Exception e) {
            log.error("Failed to send email to {} via Brevo: {}", to, e.getMessage(), e);

            notificationLog.setStatus("FAILED");
            notificationLog.setErrorMessage(e.getMessage());
            logRepository.save(notificationLog);

            throw new EmailSendException("Failed to send email via Brevo: " + e.getMessage(), e);
        }
    }
}
