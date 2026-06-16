package com.lms.courseservice.mapper;

import com.lms.courseservice.dto.request.ModuleRequestDTO;
import com.lms.courseservice.dto.response.ModuleResponseDTO;
import com.lms.courseservice.entity.Module;
import org.springframework.stereotype.Component;

@Component
public class ModuleMapper {

    public Module toEntity(ModuleRequestDTO dto) {
        if (dto == null) {
            return null;
        }
        Module module = new Module();
        module.setTitle(dto.getTitle());
        module.setDescription(dto.getDescription());
        module.setVideoUrl(dto.getVideoUrl());
        module.setResourceUrl(dto.getResourceUrl());
        module.setSequenceOrder(dto.getSequenceOrder() != null ? dto.getSequenceOrder() : 0);
        return module;
    }

    public ModuleResponseDTO toResponseDTO(Module module) {
        if (module == null) {
            return null;
        }
        ModuleResponseDTO dto = new ModuleResponseDTO();
        dto.setId(module.getId());
        dto.setCourseId(module.getCourse() != null ? module.getCourse().getId() : null);
        dto.setTitle(module.getTitle());
        dto.setDescription(module.getDescription());
        dto.setVideoUrl(module.getVideoUrl());
        dto.setResourceUrl(module.getResourceUrl());
        return dto;
    }

    public void updateEntityFromDto(ModuleRequestDTO dto, Module module) {
        if (dto == null || module == null) {
            return;
        }
        module.setTitle(dto.getTitle());
        module.setDescription(dto.getDescription());
        module.setVideoUrl(dto.getVideoUrl());
        module.setResourceUrl(dto.getResourceUrl());
        if (dto.getSequenceOrder() != null) {
            module.setSequenceOrder(dto.getSequenceOrder());
        }
    }
}
