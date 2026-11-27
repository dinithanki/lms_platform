package com.lms.userservice.messaging;

import com.lms.userservice.dto.event.StudentEnrolledEvent;
import com.lms.userservice.service.UserActivityService;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessResourceFailureException;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;

class StudentEnrolledKafkaConsumerTest {

    private final UserActivityService userActivityService = mock(UserActivityService.class);
    private final StudentEnrolledKafkaConsumer consumer = new StudentEnrolledKafkaConsumer(userActivityService);

    @Test
    void successfulEventIsProcessedBeforeListenerReturns() {
        StudentEnrolledEvent event = new StudentEnrolledEvent(UUID.randomUUID(), "StudentEnrolled",
                LocalDateTime.now(), 91L, 42L, 7L, LocalDateTime.now());

        consumer.consume(event);

        verify(userActivityService).recordStudentEnrolled(event);
    }

    @Test
    void databaseFailureIsPropagatedSoKafkaRecordIsNotAcknowledged() {
        StudentEnrolledEvent event = new StudentEnrolledEvent(UUID.randomUUID(), "StudentEnrolled",
                LocalDateTime.now(), 91L, 42L, 7L, LocalDateTime.now());
        doThrow(new DataAccessResourceFailureException("database unavailable"))
                .when(userActivityService).recordStudentEnrolled(event);

        assertThrows(DataAccessResourceFailureException.class, () -> consumer.consume(event));
    }
}
