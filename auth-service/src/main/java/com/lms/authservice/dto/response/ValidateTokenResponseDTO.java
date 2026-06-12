package com.lms.authservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ValidateTokenResponseDTO {
    private boolean valid;
    private Long userId;
    private String email;
    private String role;
}
