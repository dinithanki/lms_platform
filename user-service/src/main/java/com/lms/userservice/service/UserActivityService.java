package com.lms.userservice.service;

import com.lms.userservice.dto.event.StudentEnrolledEvent;
import com.lms.userservice.entity.UserActivity;
import com.lms.userservice.repository.UserActivityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserActivityService {
    private final UserActivityRepository userActivityRepository;

    public UserActivityService(UserActivityRepository userActivityRepository) {
        this.userActivityRepository = userActivityRepository;
    }

    @Transactional
    public void recordStudentEnrolled(StudentEnrolledEvent event) {
        if (userActivityRepository.existsById(event.eventId())) {
            return;
        }
        userActivityRepository.save(UserActivity.from(event));
    }
}
