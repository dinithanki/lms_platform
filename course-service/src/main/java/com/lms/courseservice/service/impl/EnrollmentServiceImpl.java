package com.lms.courseservice.service.impl;

import com.lms.courseservice.dto.response.CourseResponseDTO;
import com.lms.courseservice.entity.Course;
import com.lms.courseservice.entity.Enrollment;
import com.lms.courseservice.exception.EnrollmentException;
import com.lms.courseservice.mapper.CourseMapper;
import com.lms.courseservice.repository.CourseRepository;
import com.lms.courseservice.repository.EnrollmentRepository;
import com.lms.courseservice.service.CourseService;
import com.lms.courseservice.service.EnrollmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpEntity;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class EnrollmentServiceImpl implements EnrollmentService {

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private CourseService courseService;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CourseMapper courseMapper;

    @Autowired
    private RestTemplate restTemplate;

    private static final String USER_SERVICE_URL = "http://localhost:8082/api/users/";
    private static final String NOTIFICATION_SERVICE_URL = "http://localhost:8085/api/notify/email";

    @Override
    @Transactional
    public void enrollStudent(Long courseId, Long studentId) {
        // Validate course existence
        Course course = courseService.getCourseEntityById(courseId);

        // Check duplicate enrollment
        if (enrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId)) {
            throw new EnrollmentException("Student is already enrolled in this course.");
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setStudentId(studentId);
        enrollment.setCourseId(courseId);
        enrollmentRepository.save(enrollment);

        // Send confirmation email asynchronously/gracefully
        try {
            Map<?, ?> userProfile = restTemplate.getForObject(USER_SERVICE_URL + studentId, Map.class);
            if (userProfile != null && userProfile.containsKey("email")) {
                String studentEmail = (String) userProfile.get("email");
                String studentName = (String) userProfile.get("name");

                Map<String, Object> emailRequest = new HashMap<>();
                emailRequest.put("to", studentEmail);
                emailRequest.put("subject", "Course Enrollment Success - " + course.getTitle());
                emailRequest.put("message", 
                    "<div style=\"font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 20px auto; background-color: #0f172a; border-radius: 20px; border: 1px solid #1e293b; color: #f3f4f6; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);\">" +
                    "  <div style=\"background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 30px; text-align: center;\">" +
                    "    <h1 style=\"color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;\">Enrollment Confirmed!</h1>" +
                    "  </div>" +
                    "  <div style=\"padding: 30px; line-height: 1.6; color: #cbd5e1;\">" +
                    "    <p>Dear <strong>" + studentName + "</strong>,</p>" +
                    "    <p>Congratulations! You have successfully enrolled in the course: <strong style=\"color: #6366f1;\">" + course.getTitle() + "</strong>.</p>" +
                    "    <p>You can now access all learning materials, lessons, and course quizzes on the platform dashboard.</p>" +
                    "    <div style=\"text-align: center; margin: 30px 0;\">" +
                    "      <a href=\"http://localhost:5173/dashboard\" style=\"background-color: #4f46e5; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);\">Go to Dashboard</a>" +
                    "    </div>" +
                    "    <p>If you have any questions, feel free to contact your instructor or course support team.</p>" +
                    "    <p>Warm regards,<br>The LMS Platform Team</p>" +
                    "  </div>" +
                    "</div>"
                );

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(emailRequest, headers);

                restTemplate.postForEntity(NOTIFICATION_SERVICE_URL, entity, Void.class);
            }
        } catch (Exception e) {
            System.err.println("Warning: Failed to send course enrollment confirmation email: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseResponseDTO> getEnrolledCourses(Long studentId) {
        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(studentId);
        
        List<Long> courseIds = enrollments.stream()
                .map(Enrollment::getCourseId)
                .collect(Collectors.toList());

        return courseRepository.findAllById(courseIds).stream()
                .map(courseMapper::toResponseDTO)
                .collect(Collectors.toList());
    }
}
