package com.lms.courseservice.service;

import com.lms.courseservice.dto.request.CourseRequestDTO;
import com.lms.courseservice.dto.response.CourseResponseDTO;
import com.lms.courseservice.entity.Course;
import java.util.List;

public interface CourseService {
    CourseResponseDTO createCourse(CourseRequestDTO dto, String createdBy);
    CourseResponseDTO getCourseById(Long id);
    List<CourseResponseDTO> getAllCourses(String username, String role);
    Course getCourseEntityById(Long id);
    void deleteCourse(Long id);
}
