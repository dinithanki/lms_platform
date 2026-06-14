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
    public CourseResponseDTO createCourse(CourseRequestDTO dto) {
        Course course = courseMapper.toEntity(dto);
        Course savedCourse = courseRepository.save(course);
        return courseMapper.toResponseDTO(savedCourse);
    }

    @Override
    @Transactional(readOnly = true)
    public CourseResponseDTO getCourseById(Long id) {
        Course course = getCourseEntityById(id);
        return courseMapper.toResponseDTO(course);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseResponseDTO> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(courseMapper::toResponseDTO)
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
