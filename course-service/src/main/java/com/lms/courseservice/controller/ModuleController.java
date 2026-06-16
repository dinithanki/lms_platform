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
            @Valid @RequestBody ModuleRequestDTO dto) {
        ModuleResponseDTO response = moduleService.createModule(id, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/courses/{id}/modules")
    public ResponseEntity<List<ModuleResponseDTO>> getModulesByCourseId(@PathVariable Long id) {
        List<ModuleResponseDTO> response = moduleService.getModulesByCourseId(id);
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
            @RequestParam Long studentId) {
        ProgressResponseDTO response = moduleService.getCourseProgress(id, studentId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/modules/{id}")
    public ResponseEntity<ModuleResponseDTO> updateModule(
            @PathVariable Long id,
            @Valid @RequestBody ModuleRequestDTO dto) {
        ModuleResponseDTO response = moduleService.updateModule(id, dto);
        return ResponseEntity.ok(response);
    }
}
