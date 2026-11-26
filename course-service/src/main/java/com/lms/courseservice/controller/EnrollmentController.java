package com.lms.courseservice.controller;

import com.lms.courseservice.dto.request.EnrollmentRequestDTO;
import com.lms.courseservice.dto.response.CourseResponseDTO;
import com.lms.courseservice.service.EnrollmentService;
import com.lms.courseservice.security.LmsPrincipal;
import com.lms.courseservice.security.OwnershipChecks;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.List;

@RestController
public class EnrollmentController {

    @Autowired
    private EnrollmentService enrollmentService;

    @PostMapping("/courses/{id}/enroll")
    public ResponseEntity<Void> enrollStudent(
            @PathVariable Long id,
            @Valid @RequestBody EnrollmentRequestDTO request,
            @AuthenticationPrincipal LmsPrincipal principal) {
        OwnershipChecks.requireSelfOrAdmin(principal, request.getStudentId());
        enrollmentService.enrollStudent(id, request.getStudentId());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/students/{id}/courses")
    public ResponseEntity<List<CourseResponseDTO>> getEnrolledCourses(
            @PathVariable Long id, @AuthenticationPrincipal LmsPrincipal principal) {
        OwnershipChecks.requireSelfOrAdmin(principal, id);
        List<CourseResponseDTO> response = enrollmentService.getEnrolledCourses(id);
        return ResponseEntity.ok(response);
    }
}
