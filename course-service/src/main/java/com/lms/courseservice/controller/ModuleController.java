package com.lms.courseservice.controller;

import com.lms.courseservice.dto.request.ModuleRequestDTO;
import com.lms.courseservice.dto.response.ModuleResponseDTO;
import com.lms.courseservice.dto.response.ProgressResponseDTO;
import com.lms.courseservice.service.ModuleService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ModuleController {

    @Autowired
    private ModuleService moduleService;

    @PostMapping("/courses/{id}/modules")
    public ResponseEntity<ModuleResponseDTO> createModule(
            @PathVariable Long id,
            @Valid @RequestBody ModuleRequestDTO dto,
            @RequestHeader(value = "X-User-Name", required = false) String username,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        if (!"INSTRUCTOR".equalsIgnoreCase(role) && !"ADMIN".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        ModuleResponseDTO response = moduleService.createModule(id, dto, username, role);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/courses/{id}/modules")
    public ResponseEntity<List<ModuleResponseDTO>> getModulesByCourseId(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Name", required = false) String username,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        List<ModuleResponseDTO> response = moduleService.getModulesByCourseId(id, username, role);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/modules/{id}/complete")
    public ResponseEntity<Void> completeModule(
            @PathVariable Long id,
            @RequestParam Long studentId) {
        moduleService.completeModule(id, studentId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/courses/{id}/progress")
    public ResponseEntity<ProgressResponseDTO> getCourseProgress(
            @PathVariable Long id,
            @RequestParam Long studentId,
            @RequestHeader(value = "X-User-Name", required = false) String username,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        ProgressResponseDTO response = moduleService.getCourseProgress(id, studentId, username, role);
        return ResponseEntity.ok(response);
    }
}
