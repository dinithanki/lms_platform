package com.lms.courseservice.controller;

import com.lms.courseservice.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Internal Quiz Service contract protected by the Quiz Service token filter. */
@RestController
@RequestMapping("/internal/courses")
public class InternalCourseController {
    @Autowired private CourseService courseService;

    @GetMapping("/{id}/owner")
    public ResponseEntity<Long> getCourseOwner(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseEntityById(id).getOwnerId());
    }
}
