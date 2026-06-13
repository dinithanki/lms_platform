package com.lms.userservice.dto;

import lombok.Data;

@Data
public class UserUpdateRequestDTO {
    private String name;
    private String phone;
    private String bio;
}
