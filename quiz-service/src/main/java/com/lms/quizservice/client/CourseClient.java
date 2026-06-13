package com.lms.quizservice.client;

import com.lms.quizservice.dto.response.ProgressResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "course-service", url = "${course-service.url:http://localhost:8083}")
public interface CourseClient {

    @GetMapping("/courses/{id}/progress")
    ProgressResponseDTO getCourseProgress(
            @PathVariable("id") Long id,
            @RequestParam("studentId") Long studentId);

    @PostMapping("/courses/{id}/quiz")
    Object submitQuizResult(
            @PathVariable("id") Long id,
            @RequestParam("studentId") Long studentId,
            @RequestParam("score") double score);
}
