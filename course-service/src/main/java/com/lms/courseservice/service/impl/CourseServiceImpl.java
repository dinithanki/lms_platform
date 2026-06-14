package com.lms.courseservice.service.impl;

import com.lms.courseservice.dto.request.CourseRequestDTO;
import com.lms.courseservice.dto.response.CourseResponseDTO;
import com.lms.courseservice.entity.Course;
import com.lms.courseservice.exception.CourseNotFoundException;
import com.lms.courseservice.mapper.CourseMapper;
import com.lms.courseservice.repository.CourseRepository;
import com.lms.courseservice.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourseServiceImpl implements CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CourseMapper courseMapper;

    @Autowired
    private com.lms.courseservice.repository.EnrollmentRepository enrollmentRepository;

    @Autowired
    private com.lms.courseservice.repository.CertificateRepository certificateRepository;

    @Autowired
    private com.lms.courseservice.repository.QuizResultRepository quizResultRepository;

    @Autowired
    private com.lms.courseservice.repository.ModuleProgressRepository moduleProgressRepository;

    @Override
    @Transactional
    public CourseResponseDTO createCourse(CourseRequestDTO dto, String createdBy) {
        Course course = courseMapper.toEntity(dto);
        course.setCreatedBy(createdBy);
        Course savedCourse = courseRepository.save(course);
        CourseResponseDTO response = courseMapper.toResponseDTO(savedCourse);
        response.setEnrolledStudentsCount(0L);
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public CourseResponseDTO getCourseById(Long id) {
        Course course = getCourseEntityById(id);
        CourseResponseDTO response = courseMapper.toResponseDTO(course);
        response.setEnrolledStudentsCount(enrollmentRepository.countByCourseId(id));
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseResponseDTO> getAllCourses(String username, String role) {
        List<Course> courses;
        if ("TEACHER".equalsIgnoreCase(role) || "INSTRUCTOR".equalsIgnoreCase(role)) {
            courses = courseRepository.findByCreatedBy(username);
        } else {
            courses = courseRepository.findAll();
        }
        return courses.stream()
                .map(course -> {
                    CourseResponseDTO dto = courseMapper.toResponseDTO(course);
                    dto.setEnrolledStudentsCount(enrollmentRepository.countByCourseId(course.getId()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Course getCourseEntityById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new CourseNotFoundException("Course with ID " + id + " not found"));
    }

    @Override
    @Transactional
    public void deleteCourse(Long id) {
        Course course = getCourseEntityById(id);

        // Clean up certificates
        certificateRepository.deleteByCourseId(id);

        // Clean up quiz results
        quizResultRepository.deleteByCourseId(id);

        // Clean up module progress
        List<Long> moduleIds = course.getModules().stream()
                .map(com.lms.courseservice.entity.Module::getId)
                .collect(Collectors.toList());
        if (!moduleIds.isEmpty()) {
            moduleProgressRepository.deleteByModuleIdIn(moduleIds);
        }

        // Clean up enrollments
        enrollmentRepository.deleteByCourseId(id);

        // Delete the course
        courseRepository.delete(course);
    }
}
