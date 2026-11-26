package com.lms.courseservice;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import org.junit.jupiter.api.Test;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;

import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertTrue;

class CertificateTemplateRenderingTest {

    @Test
    void rendersCertificatePdfWithSeparatedCenteredAwardLines() throws Exception {
        ClassLoaderTemplateResolver resolver = new ClassLoaderTemplateResolver();
        resolver.setPrefix("templates/");
        resolver.setSuffix(".html");
        resolver.setTemplateMode(TemplateMode.HTML);
        resolver.setCharacterEncoding("UTF-8");

        TemplateEngine templateEngine = new TemplateEngine();
        templateEngine.setTemplateResolver(resolver);

        Context context = new Context();
        context.setVariable("studentName", "SAMPLE STUDENT");
        context.setVariable("courseName", "ghh");
        context.setVariable("score", 100.0);
        context.setVariable("certificateId", "LMS-TEST-1234");
        context.setVariable("issueDate", "November 26, 2026");

        String html = templateEngine.process("certificate", context);
        assertTrue(html.contains("SAMPLE STUDENT"));
        assertTrue(html.contains("for successfully meeting all academic requirements"));
        assertTrue(html.contains("and passing the final examinations for the course"));
        assertTrue(html.contains("class=\"course-name\""));
        assertTrue(html.contains("class=\"cert-score\""));

        ByteArrayOutputStream output = new ByteArrayOutputStream();
        PdfRendererBuilder builder = new PdfRendererBuilder();
        builder.useFastMode();
        builder.withHtmlContent(html, "");
        builder.toStream(output);
        builder.run();

        byte[] pdf = output.toByteArray();
        assertTrue(pdf.length > 1_000, "Rendered certificate PDF should not be empty");
        assertTrue(new String(pdf, 0, 5).equals("%PDF-"), "Output should be a PDF");

        Path preview = Path.of("target", "certificate-preview.pdf");
        Files.createDirectories(preview.getParent());
        Files.write(preview, pdf);
    }
}
