package com.lms.userservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RoleUpdateRequestDTO {
    @NotBlank(message = "Role is required")
    private String role;
}
