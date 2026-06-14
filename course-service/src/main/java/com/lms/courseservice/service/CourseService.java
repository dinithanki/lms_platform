package com.lms.courseservice.service;

import com.lms.courseservice.dto.request.CourseRequestDTO;
import com.lms.courseservice.dto.response.CourseResponseDTO;
import com.lms.courseservice.entity.Course;
import java.util.List;

public interface CourseService {
    CourseResponseDTO createCourse(CourseRequestDTO dto, String createdBy);
    CourseResponseDTO getCourseById(Long id);
    CourseResponseDTO getCourseById(Long id, String username, String role);
    List<CourseResponseDTO> getAllCourses(String username, String role);
    Course getCourseEntityById(Long id);
    Course getCourseEntityById(Long id, String username, String role);
    CourseResponseDTO updateCourse(Long id, CourseRequestDTO dto, String username, String role);
    void deleteCourse(Long id);
    void deleteCourse(Long id, String username, String role);
}
