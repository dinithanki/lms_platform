package com.lms.notificationservice.service.impl;

import com.lms.notificationservice.exception.EmailSendException;
import com.lms.notificationservice.model.NotificationLog;
import com.lms.notificationservice.repository.NotificationLogRepository;
import com.lms.notificationservice.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Slf4j
@Service
public class EmailServiceImpl implements EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:mock}")
    private String senderEmail;

    @Value("${spring.mail.host:mock}")
    private String mailHost;

    @Autowired
    private NotificationLogRepository logRepository;

    @Override
    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        log.info("Preparing to send email to: {} with subject: '{}'", to, subject);

        NotificationLog notificationLog = new NotificationLog();
        notificationLog.setRecipient(to);
        notificationLog.setSubject(subject);
        notificationLog.setSentAt(LocalDateTime.now());

        if (mailSender == null || "mock".equalsIgnoreCase(mailHost) || "mock".equalsIgnoreCase(senderEmail)) {
            log.info("-----------------[ MOCK EMAIL DELIVERY ]-----------------");
            log.info("Recipient: {}", to);
            log.info("Sender: {}", senderEmail);
            log.info("Subject: {}", subject);
            log.info("Content Preview:\n{}", htmlContent);
            
            // Extract and print any links found in the HTML for easy clicking in the dev console
            java.util.regex.Matcher matcher = java.util.regex.Pattern.compile("href='([^']+)'").matcher(htmlContent);
            if (matcher.find()) {
                log.info("👉 DEV TESTING LINK (Ctrl+Click to open in browser): {}", matcher.group(1));
            }
            
            // Extract and print any 6-digit OTP code found in the HTML for easy copy-pasting in local dev
            java.util.regex.Matcher otpMatcher = java.util.regex.Pattern.compile("class='otp-code'>(\\d{6})</h2>").matcher(htmlContent);
            if (otpMatcher.find()) {
                log.info("👉 DEV TESTING OTP CODE: {}", otpMatcher.group(1));
            }
            
            log.info("---------------------------------------------------------");

            notificationLog.setStatus("SUCCESS");
            logRepository.save(notificationLog);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(senderEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Email sent successfully to {} via SMTP", to);

            notificationLog.setStatus("SUCCESS");
            logRepository.save(notificationLog);

        } catch (Exception e) {
            log.error("Failed to send email to {} via SMTP: {}", to, e.getMessage(), e);

            notificationLog.setStatus("FAILED");
            notificationLog.setErrorMessage(e.getMessage());
            logRepository.save(notificationLog);

            throw new EmailSendException("Failed to send email via SMTP: " + e.getMessage(), e);
        }
    }
}
