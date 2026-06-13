package com.lms.userservice.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserProfileResponseDTO {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String phone;
    private String bio;
    private String profileImageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
