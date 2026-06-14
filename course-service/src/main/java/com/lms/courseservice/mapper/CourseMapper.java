package com.lms.courseservice.mapper;

import com.lms.courseservice.dto.request.CourseRequestDTO;
import com.lms.courseservice.dto.response.CourseResponseDTO;
import com.lms.courseservice.entity.Course;
import org.springframework.stereotype.Component;

@Component
public class CourseMapper {

    public Course toEntity(CourseRequestDTO dto) {
        if (dto == null) {
            return null;
        }
        Course course = new Course();
        course.setTitle(dto.getTitle());
        course.setDescription(dto.getDescription());
        if (dto.getPublished() != null) {
            course.setPublished(dto.getPublished());
        }
        return course;
    }

    public CourseResponseDTO toResponseDTO(Course course) {
        if (course == null) {
            return null;
        }
        CourseResponseDTO dto = new CourseResponseDTO();
        dto.setId(course.getId());
        dto.setTitle(course.getTitle());
        dto.setDescription(course.getDescription());
        dto.setCreatedBy(course.getCreatedBy());
        dto.setCreatedAt(course.getCreatedAt());
        dto.setPublished(course.isPublished());
        return dto;
    }
}
