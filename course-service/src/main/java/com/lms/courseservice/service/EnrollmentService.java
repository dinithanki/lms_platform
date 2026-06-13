package com.lms.courseservice.service;

import com.lms.courseservice.dto.response.CourseResponseDTO;
import java.util.List;

public interface EnrollmentService {
    void enrollStudent(Long courseId, Long studentId);
    List<CourseResponseDTO> getEnrolledCourses(Long studentId);
}
