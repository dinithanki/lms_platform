package com.lms.courseservice.util;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Component
public class CertificateGenerator {

    @Autowired
    private TemplateEngine templateEngine;

    public byte[] generateCertificatePdf(Map<String, Object> templateModel) {
        try {
            // Create Thymeleaf context and set model variables
            Context context = new Context();
            context.setVariables(templateModel);

            // Render HTML using Thymeleaf template engine
            // The template should be named "certificate" corresponding to templates/certificate.html
            String htmlContent = templateEngine.process("certificate", context);

            // Generate PDF from HTML content using OpenHTMLToPDF
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            builder.withHtmlContent(htmlContent, "");
            builder.toStream(outputStream);
            builder.run();

            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF certificate: " + e.getMessage(), e);
        }
    }
}
