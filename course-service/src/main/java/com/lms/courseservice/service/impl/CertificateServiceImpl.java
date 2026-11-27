package com.lms.courseservice.service.impl;

import com.lms.courseservice.entity.Certificate;
import com.lms.courseservice.entity.Course;
import com.lms.courseservice.entity.QuizResult;
import com.lms.courseservice.exception.CourseNotFoundException;
import com.lms.courseservice.repository.CertificateRepository;
import com.lms.courseservice.repository.QuizResultRepository;
import com.lms.courseservice.service.CertificateService;
import com.lms.courseservice.service.CourseService;
import com.lms.courseservice.service.ModuleService;
import com.lms.courseservice.util.CertificateGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class CertificateServiceImpl implements CertificateService {

    @Autowired
    private CertificateRepository certificateRepository;

    @Autowired
    private QuizResultRepository quizResultRepository;

    @Autowired
    private ModuleService moduleService;

    @Autowired
    private CourseService courseService;

    @Autowired
    private CertificateGenerator certificateGenerator;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${app.user-service.url:http://localhost:8082}")
    private String userServiceUrl = "http://localhost:8082";

    @Override
    @Transactional
    public byte[] getCertificatePdf(Long studentId, Long courseId, String authorization) {
        // 1. Verify course existence
        Course course = courseService.getCourseEntityById(courseId);

        // 2. Verify all modules completed
        boolean allCompleted = moduleService.areAllModulesCompleted(courseId, studentId);
        if (!allCompleted) {
            throw new IllegalStateException("Certificate cannot be generated: Student has not completed all course modules.");
        }

        // 3. Verify quiz completion and passing requirements
        QuizResult quizResult = quizResultRepository.findByStudentIdAndCourseId(studentId, courseId)
                .orElseThrow(() -> new IllegalStateException("Certificate cannot be generated: Student has not attempted the course quiz."));

        if (quizResult.getAttempts() > 5) {
            throw new IllegalStateException("Certificate cannot be generated: Student has exceeded the maximum limit of 5 quiz attempts.");
        }

        if (quizResult.getScore() < 60.0) {
            throw new IllegalStateException("Certificate cannot be generated: Student did not achieve the passing score of 60%. Current score: " + quizResult.getScore() + "%");
        }

        // 4. Retrieve or create certificate record
        Certificate certificate;
        Optional<Certificate> existingCert = certificateRepository.findByStudentIdAndCourseId(studentId, courseId);
        if (existingCert.isPresent()) {
            certificate = existingCert.get();
        } else {
            certificate = new Certificate();
            // Generate unique professional Certificate ID
            String certId = "LMS-" + courseId + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            certificate.setCertificateId(certId);
            certificate.setStudentId(studentId);
            certificate.setCourseId(courseId);
            certificate.setScore(quizResult.getScore());
            certificate.setIssuedDate(LocalDateTime.now());
            certificate = certificateRepository.save(certificate);
        }

        // 5. Fetch student name from User Service (with fallback)
        String studentName = fetchStudentName(studentId, authorization);

        // 6. Format issue date
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy");
        String formattedDate = certificate.getIssuedDate().format(formatter);

        // 7. Prepare Thymeleaf template model variables
        Map<String, Object> templateModel = new HashMap<>();
        templateModel.put("studentName", studentName);
        templateModel.put("courseName", course.getTitle());
        templateModel.put("score", certificate.getScore());
        templateModel.put("certificateId", certificate.getCertificateId());
        templateModel.put("issueDate", formattedDate);
        DateTimeFormatter issueDateTimeFormatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy 'at' hh:mm a");
        templateModel.put("issueDateTime", certificate.getIssuedDate().format(issueDateTimeFormatter));

        // 8. Generate and return PDF bytes
        return certificateGenerator.generateCertificatePdf(templateModel);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Certificate> getCertificatesByStudent(Long studentId) {
        return certificateRepository.findByStudentId(studentId);
    }

    private String fetchStudentName(Long studentId, String authorization) {
        try {
            HttpHeaders headers = new HttpHeaders();
            if (authorization != null && !authorization.isBlank()) {
                headers.set(HttpHeaders.AUTHORIZATION, authorization);
            }
            ResponseEntity<Map> userResponse = restTemplate.exchange(
                    userServiceUrl + "/api/users/" + studentId,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    Map.class);
            Map<?, ?> response = userResponse.getBody();
            if (response != null) {
                Object name = response.get("name");
                if (name != null && !name.toString().isBlank()) {
                    return name.toString().trim();
                }
            }
        } catch (Exception e) {
            // Log failure & fall back gracefully to a generic display name
            System.err.println("Warning: Could not connect to User Service or find user: " + e.getMessage());
        }
        return "Student #" + studentId;
    }
}
