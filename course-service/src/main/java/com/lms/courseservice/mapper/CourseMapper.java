package com.lms.courseservice.mapper;

import com.lms.courseservice.dto.request.CourseRequestDTO;
import com.lms.courseservice.dto.response.CourseResponseDTO;
import com.lms.courseservice.entity.Course;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.stream.Collectors;

@Component
public class CourseMapper {

    @Autowired
    private ModuleMapper moduleMapper;

    public Course toEntity(CourseRequestDTO dto) {
        if (dto == null) {
            return null;
        }
        Course course = new Course();
        course.setTitle(dto.getTitle());
        course.setDescription(dto.getDescription());
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
        if (course.getModules() != null) {
            dto.setModules(course.getModules().stream()
                .map(moduleMapper::toResponseDTO)
                .collect(Collectors.toList()));
        }
        return dto;
    }
}
