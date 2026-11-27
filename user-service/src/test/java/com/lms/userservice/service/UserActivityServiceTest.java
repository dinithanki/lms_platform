package com.lms.userservice.service;

import com.lms.userservice.dto.event.StudentEnrolledEvent;
import com.lms.userservice.entity.UserActivity;
import com.lms.userservice.repository.UserActivityRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@DataJpaTest(properties = {
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.flyway.enabled=false"
})
@Import(UserActivityService.class)
class UserActivityServiceTest {

    @Autowired private UserActivityService userActivityService;
    @Autowired private UserActivityRepository userActivityRepository;

    @Test
    void recordsStudentEnrolledEvent() {
        StudentEnrolledEvent event = event();

        userActivityService.recordStudentEnrolled(event);

        UserActivity activity = userActivityRepository.findById(event.eventId()).orElseThrow();
        assertEquals(42L, activity.getUserId());
        assertEquals("StudentEnrolled", activity.getEventType());
        assertEquals(7L, activity.getCourseId());
        assertEquals(91L, activity.getEnrollmentId());
        assertEquals(event.occurredAt(), activity.getOccurredAt());
    }

    @Test
    void duplicateEventIdDoesNotCreateAnotherActivity() {
        StudentEnrolledEvent event = event();

        userActivityService.recordStudentEnrolled(event);
        userActivityService.recordStudentEnrolled(event);

        assertEquals(1, userActivityRepository.count());
    }

    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void databaseConstraintFailureIsPropagatedAndDoesNotPersistActivity() {
        StudentEnrolledEvent event = new StudentEnrolledEvent(UUID.randomUUID(), null,
                LocalDateTime.of(2026, 11, 27, 9, 30), 91L, 42L, 7L,
                LocalDateTime.of(2026, 11, 27, 9, 29));

        assertThrows(RuntimeException.class, () -> userActivityService.recordStudentEnrolled(event));

        assertEquals(0, userActivityRepository.count());
    }

    private StudentEnrolledEvent event() {
        return new StudentEnrolledEvent(UUID.randomUUID(), "StudentEnrolled",
                LocalDateTime.of(2026, 11, 27, 9, 30), 91L, 42L, 7L,
                LocalDateTime.of(2026, 11, 27, 9, 29));
    }
}
