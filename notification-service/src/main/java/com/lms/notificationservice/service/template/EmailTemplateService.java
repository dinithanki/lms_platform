package com.lms.notificationservice.service.template;

import org.springframework.stereotype.Service;

@Service
public class EmailTemplateService {

    private String getHeaderTemplate(String title) {
        return "<!DOCTYPE html>\n" +
                "<html>\n" +
                "<head>\n" +
                "  <meta charset='utf-8'>\n" +
                "  <meta name='viewport' content='width=device-width, initial-scale=1.0'>\n" +
                "  <title>" + title + "</title>\n" +
                "  <style>\n" +
                "    body { font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #030712; color: #f3f4f6; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }\n" +
                "    .wrapper { max-width: 600px; margin: 40px auto; background-color: #0f172a; border-radius: 24px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.8), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }\n" +
                "    .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 40px 30px; text-align: center; }\n" +
                "    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em; }\n" +
                "    .header p { color: #c7d2fe; margin: 8px 0 0 0; font-size: 14px; font-weight: 500; }\n" +
                "    .content { padding: 40px 30px; line-height: 1.7; font-size: 15px; color: #cbd5e1; }\n" +
                "    .button-container { text-align: center; margin: 35px 0; }\n" +
                "    .button { background-color: #4f46e5; color: #ffffff !important; padding: 14px 30px; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 12px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2), 0 2px 4px -1px rgba(79, 70, 229, 0.1); transition: background-color 0.2s; }\n" +
                "    .otp-card { background-color: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 25px; text-align: center; margin: 30px 0; }\n" +
                "    .otp-code { font-size: 36px; font-weight: 800; color: #6366f1; letter-spacing: 6px; margin: 0; font-family: monospace; }\n" +
                "    .footer { background-color: #090d16; padding: 25px 30px; text-align: center; border-top: 1px solid #1e293b; font-size: 12px; color: #64748b; }\n" +
                "    .footer a { color: #6366f1; text-decoration: none; }\n" +
                "    hr { border: 0; border-top: 1px solid #1e293b; margin: 25px 0; }\n" +
                "  </style>\n" +
                "</head>\n" +
                "<body>\n" +
                "  <div class='wrapper'>\n";
    }

    private String getFooterTemplate() {
        return "    <div class='footer'>\n" +
                "      <p>&copy; 2026 LMS Platform. All rights reserved.</p>\n" +
                "      <p>Need support? Contact us at <a href='mailto:support@lmsplatform.com'>support@lmsplatform.com</a></p>\n" +
                "    </div>\n" +
                "  </div>\n" +
                "</body>\n" +
                "</html>";
    }

    public String buildWelcomeEmail(String name) {
        return getHeaderTemplate("Welcome to LMS Platform") +
                "    <div class='header'>\n" +
                "      <h1>LMS PLATFORM</h1>\n" +
                "      <p>Your Journey to Knowledge Begins Here</p>\n" +
                "    </div>\n" +
                "    <div class='content'>\n" +
                "      <h2 style='color: #f3f4f6; margin-top: 0; font-size: 20px;'>Welcome, " + name + "!</h2>\n" +
                "      <p>We are absolutely thrilled to welcome you to the <strong>LMS Platform</strong> community. Whether you're here to learn new skills, launch a new career path, or manage coursework, our modern platform provides all the tools you need to succeed.</p>\n" +
                "      <p>Get ready to access premium course content, challenging quizzes, interactive modules, and custom certificates designed to showcase your accomplishments.</p>\n" +
                "      <div class='button-container'>\n" +
                "        <a href='http://localhost:5173/dashboard' class='button'>Go to Dashboard</a>\n" +
                "      </div>\n" +
                "      <p>If you have any questions, our support team is always ready to guide you.</p>\n" +
                "      <p>Warm regards,<br>The LMS Platform Team</p>\n" +
                "    </div>\n" +
                "    " + getFooterTemplate();
    }

    public String buildOtpEmail(String otp) {
        return getHeaderTemplate("One-Time Verification Code") +
                "    <div class='header'>\n" +
                "      <h1>Verification Required</h1>\n" +
                "      <p>Secure Account Access</p>\n" +
                "    </div>\n" +
                "    <div class='content'>\n" +
                "      <h2 style='color: #f3f4f6; margin-top: 0; font-size: 18px; text-align: center;'>Verify Your Identity</h2>\n" +
                "      <p>You requested access or registered a new account on our LMS Platform. Please use the following One-Time Password (OTP) to complete the verification process.</p>\n" +
                "      <div class='otp-card'>\n" +
                "        <p style='margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; font-weight: 700;'>Your Verification Code</p>\n" +
                "        <h2 class='otp-code'>" + otp + "</h2>\n" +
                "      </div>\n" +
                "      <p style='color: #ef4444; font-size: 13px; font-weight: 500; text-align: center;'>⚠️ This code is strictly confidential and will expire in 5 minutes.</p>\n" +
                "      <hr>\n" +
                "      <p style='font-size: 12px; color: #64748b;'>If you did not make this request, please ignore this email. Your password has not been changed, and your account remains secure.</p>\n" +
                "      <p>Best regards,<br>LMS Platform Security Team</p>\n" +
                "    </div>\n" +
                "    " + getFooterTemplate();
    }

    public String buildResetPasswordEmail(String link) {
        return getHeaderTemplate("Reset Your Password") +
                "    <div class='header'>\n" +
                "      <h1>Reset Password</h1>\n" +
                "      <p>Recover Your Access Securely</p>\n" +
                "    </div>\n" +
                "    <div class='content'>\n" +
                "      <h2 style='color: #f3f4f6; margin-top: 0; font-size: 18px;'>Hello,</h2>\n" +
                "      <p>We received a request to reset the password associated with your LMS Platform account. Click the button below to choose a new, secure password.</p>\n" +
                "      <div class='button-container'>\n" +
                "        <a href='" + link + "' class='button'>Reset Password</a>\n" +
                "      </div>\n" +
                "      <p>For security reasons, this link is single-use only and **expires in 15 minutes**. If the button above does not work, copy and paste this URL into your web browser:</p>\n" +
                "      <p style='word-break: break-all; font-size: 13px; background-color: #1e293b; padding: 12px 18px; border-radius: 8px; border: 1px dashed #334155; color: #94a3b8; font-family: monospace;'>" + link + "</p>\n" +
                "      <hr>\n" +
                "      <p style='font-size: 12px; color: #64748b;'>If you did not initiate this request, no action is required on your part. Your login credentials will remain unchanged.</p>\n" +
                "      <p>Best regards,<br>LMS Platform Security Team</p>\n" +
                "    </div>\n" +
                "    " + getFooterTemplate();
    }
}
