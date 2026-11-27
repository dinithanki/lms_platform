package com.lms.userservice.messaging;

import com.lms.userservice.dto.event.StudentEnrolledEvent;
import com.lms.userservice.service.UserActivityService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class StudentEnrolledKafkaConsumer {
    private final UserActivityService userActivityService;

    public StudentEnrolledKafkaConsumer(UserActivityService userActivityService) {
        this.userActivityService = userActivityService;
    }

    @KafkaListener(topics = "${app.kafka.topics.student-enrolled}")
    public void consume(StudentEnrolledEvent event) {
        userActivityService.recordStudentEnrolled(event);
    }
}
