package com.lms.courseservice.service;

import com.lms.courseservice.dto.request.CourseRequestDTO;
import com.lms.courseservice.dto.response.CourseResponseDTO;
import com.lms.courseservice.entity.Course;
import com.lms.courseservice.security.LmsPrincipal;
import java.util.List;

public interface CourseService {
    CourseResponseDTO createCourse(CourseRequestDTO dto, Long ownerId);
    CourseResponseDTO getCourseById(Long id);
    List<CourseResponseDTO> getAllCourses();
    Course getCourseEntityById(Long id);
    void deleteCourse(Long id, LmsPrincipal principal);
}
