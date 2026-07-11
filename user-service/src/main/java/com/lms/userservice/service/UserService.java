package com.lms.userservice.service;

import com.lms.userservice.dto.UserCreateRequestDTO;
import com.lms.userservice.dto.UserUpdateRequestDTO;
import com.lms.userservice.entity.User;
import com.lms.userservice.security.UserPrincipal;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserService {
    User createUser(UserCreateRequestDTO dto);
    User getUserById(Long id);
    List<User> getAllUsers();
    User updateUser(Long id, UserUpdateRequestDTO dto, UserPrincipal principal);
    void deleteUser(Long id);
    User updateUserRole(Long id, String role, String authHeader);
    User syncUserRole(Long id, String role); // Internal sync — no cross-service callback
    User updateProfileImage(Long id, MultipartFile file, UserPrincipal principal);
    Resource getProfileImage(Long id);
}
