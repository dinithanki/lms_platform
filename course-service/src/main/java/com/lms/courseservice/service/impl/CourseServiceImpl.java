package com.lms.courseservice.service.impl;

import com.lms.courseservice.dto.request.CourseRequestDTO;
import com.lms.courseservice.dto.response.CourseResponseDTO;
import com.lms.courseservice.entity.Course;
import com.lms.courseservice.exception.CourseNotFoundException;
import com.lms.courseservice.mapper.CourseMapper;
import com.lms.courseservice.repository.*;
import com.lms.courseservice.service.CourseService;
import com.lms.courseservice.entity.Module;
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
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private CertificateRepository certificateRepository;

    @Autowired
    private QuizResultRepository quizResultRepository;

    @Autowired
    private ModuleProgressRepository moduleProgressRepository;

    @Autowired
    private CourseMapper courseMapper;

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

        // 1. Delete associated enrollments
        enrollmentRepository.deleteByCourseId(id);

        // 2. Delete associated quiz results
        quizResultRepository.deleteByCourseId(id);

        // 3. Delete associated certificates
        certificateRepository.deleteByCourseId(id);

        // 4. Delete associated module progresses
        List<Long> moduleIds = course.getModules().stream()
                .map(Module::getId)
                .collect(Collectors.toList());
        if (!moduleIds.isEmpty()) {
            moduleProgressRepository.deleteByModuleIdIn(moduleIds);
        }

        // 5. Delete the course itself (cascades to modules)
        courseRepository.delete(course);
    }
}
