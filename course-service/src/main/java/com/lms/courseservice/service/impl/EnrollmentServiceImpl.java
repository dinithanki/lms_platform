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

        // Send in-app notification
        try {
            Map<?, ?> userProfile = restTemplate.getForObject(USER_SERVICE_URL + studentId, Map.class);
            if (userProfile != null && userProfile.containsKey("email")) {
                String studentEmail = (String) userProfile.get("email");

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                Map<String, Object> inAppRequest = new HashMap<>();
                inAppRequest.put("recipient", studentEmail);
                inAppRequest.put("title", "Course Enrollment Confirmed! 🎓");
                inAppRequest.put("message", "You have successfully enrolled in the course: " + course.getTitle() + ". You can now access all learning materials and quizzes from your dashboard.");
                inAppRequest.put("type", "COURSE_ENROLLMENT");

                HttpEntity<Map<String, Object>> inAppEntity = new HttpEntity<>(inAppRequest, headers);
                restTemplate.postForEntity("http://localhost:8085/api/notify/in-app", inAppEntity, Void.class);
            }
        } catch (Exception e) {
            System.err.println("Warning: Failed to send in-app enrollment notification: " + e.getMessage());
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
