package com.lms.courseservice.service.impl;

import com.lms.courseservice.dto.request.CourseRequestDTO;
import com.lms.courseservice.dto.response.CourseResponseDTO;
import com.lms.courseservice.entity.Course;
import com.lms.courseservice.exception.CourseAccessDeniedException;
import com.lms.courseservice.exception.CourseNotFoundException;
import com.lms.courseservice.mapper.CourseMapper;
import com.lms.courseservice.repository.CourseRepository;
import com.lms.courseservice.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import com.lms.courseservice.security.Role;

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
        // ensure published flag if provided
        if (dto.getPublished() != null) {
            course.setPublished(dto.getPublished());
        }
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
    public CourseResponseDTO getCourseById(Long id, String username, String role) {
        Course course = getCourseEntityById(id, username, role);
        CourseResponseDTO response = courseMapper.toResponseDTO(course);
        response.setEnrolledStudentsCount(enrollmentRepository.countByCourseId(id));
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseResponseDTO> getAllCourses(String username, String role) {
        List<Course> courses;
        if (Role.isAdmin(role)) {
            courses = courseRepository.findAll();
        } else if (Role.isInstructor(role)) {
            courses = StringUtils.hasText(username) ? courseRepository.findByCreatedBy(username) : List.of();
        } else {
            // students and anonymous see only published courses
            courses = courseRepository.findByPublishedTrue();
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
    @Transactional(readOnly = true)
    public Course getCourseEntityById(Long id, String username, String role) {
        Course course = getCourseEntityById(id);
        // Admin can access any course
        if (Role.isAdmin(role)) {
            return course;
        }

        // Instructors can view only their own courses
        if (Role.isInstructor(role)) {
            if (StringUtils.hasText(username) && username.equals(course.getCreatedBy())) {
                return course;
            }
            throw new CourseAccessDeniedException("You can only access your own course.");
        }

        // Students and unauthenticated users can view only published courses
        if (course.isPublished()) {
            return course;
        }
        throw new CourseAccessDeniedException("Course is not published.");
    }

    @Override
    @Transactional
    public CourseResponseDTO updateCourse(Long id, CourseRequestDTO dto, String username, String role) {
        Course course = getCourseEntityById(id);
        // enforce ownership/role for update
        verifyTeacherOwnership(course, username, role);
        course.setTitle(dto.getTitle());
        course.setDescription(dto.getDescription());
        if (dto.getPublished() != null) {
            course.setPublished(dto.getPublished());
        }
        Course savedCourse = courseRepository.save(course);
        CourseResponseDTO response = courseMapper.toResponseDTO(savedCourse);
        response.setEnrolledStudentsCount(enrollmentRepository.countByCourseId(id));
        return response;
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

    @Override
    @Transactional
    public void deleteCourse(Long id, String username, String role) {
        Course course = getCourseEntityById(id);
        verifyTeacherOwnership(course, username, role);

        certificateRepository.deleteByCourseId(id);
        quizResultRepository.deleteByCourseId(id);

        List<Long> moduleIds = course.getModules().stream()
                .map(com.lms.courseservice.entity.Module::getId)
                .collect(Collectors.toList());
        if (!moduleIds.isEmpty()) {
            moduleProgressRepository.deleteByModuleIdIn(moduleIds);
        }

        enrollmentRepository.deleteByCourseId(id);
        courseRepository.delete(course);
    }

    private void verifyTeacherOwnership(Course course, String username, String role) {
        // Admin bypasses ownership
        if (Role.isAdmin(role)) {
            return;
        }

        if (Role.isInstructor(role)) {
            if (!StringUtils.hasText(username) || !username.equals(course.getCreatedBy())) {
                throw new CourseAccessDeniedException("You can only access your own course.");
            }
            return;
        }

        // Others (students) cannot perform ownership-protected actions
        throw new CourseAccessDeniedException("Access denied.");
    }

}
