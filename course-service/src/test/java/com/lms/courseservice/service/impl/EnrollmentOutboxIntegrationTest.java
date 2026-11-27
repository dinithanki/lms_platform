package com.lms.courseservice.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lms.courseservice.entity.Enrollment;
import com.lms.courseservice.entity.OutboxEvent;
import com.lms.courseservice.mapper.CourseMapper;
import com.lms.courseservice.repository.EnrollmentRepository;
import com.lms.courseservice.repository.OutboxEventRepository;
import com.lms.courseservice.service.CourseService;
import com.lms.courseservice.service.OutboxPublisher;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.eq;

@DataJpaTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:enrollment-outbox;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.flyway.enabled=false"
})
@Import({EnrollmentServiceImpl.class, OutboxPublisher.class, EnrollmentOutboxIntegrationTest.JsonConfiguration.class})
class EnrollmentOutboxIntegrationTest {

    @Autowired private EnrollmentServiceImpl enrollmentService;
    @Autowired private EnrollmentRepository enrollmentRepository;
    @Autowired private OutboxEventRepository outboxEventRepository;
    @Autowired private PlatformTransactionManager transactionManager;
    @Autowired private OutboxPublisher outboxPublisher;
    @MockBean private CourseService courseService;
    @MockBean private CourseMapper courseMapper;
    @MockBean private KafkaTemplate<String, String> kafkaTemplate;

    @Test
    void enrollmentAndOutboxRecordAreSavedTogether() {
        when(courseService.getCourseEntityById(7L)).thenReturn(null);

        enrollmentService.enrollStudent(7L, 42L);

        Enrollment enrollment = enrollmentRepository.findByStudentIdAndCourseId(42L, 7L).orElseThrow();
        OutboxEvent outbox = outboxEventRepository.findAll().get(0);
        assertEquals(true, outbox.getPayload().contains("\"enrollmentId\":" + enrollment.getId()));
        assertEquals(true, outbox.getPayload().contains("\"studentId\":42"));
        assertEquals(OutboxEvent.DeliveryStatus.PENDING, outbox.getDeliveryStatus());
        assertEquals("lms.course.student-enrolled", outbox.getTopic());
    }

    @Test
    void rollingBackEnrollmentTransactionAlsoRollsBackOutboxRecord() {
        when(courseService.getCourseEntityById(7L)).thenReturn(null);
        TransactionTemplate template = new TransactionTemplate(transactionManager);
        template.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);

        assertThrows(IllegalStateException.class, () -> template.executeWithoutResult(status -> {
            enrollmentService.enrollStudent(7L, 42L);
            throw new IllegalStateException("force rollback");
        }));

        assertEquals(0, enrollmentRepository.count());
        assertEquals(0, outboxEventRepository.count());
    }

    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void publisherClaimsPendingRowsWithNativeSkipLockedQueryInsideItsTransaction() throws Exception {
        OutboxEvent event = outboxEventRepository.saveAndFlush(OutboxEvent.pending(
                UUID.randomUUID(), "StudentEnrolled", "lms.course.student-enrolled", "{\"studentId\":42}"));
        when(kafkaTemplate.send(eq(event.getTopic()), eq(event.getEventId().toString()), eq(event.getPayload())))
                .thenReturn(CompletableFuture.completedFuture(null));

        outboxPublisher.publishPendingEvents();

        OutboxEvent published = outboxEventRepository.findById(event.getEventId()).orElseThrow();
        assertEquals(OutboxEvent.DeliveryStatus.PUBLISHED, published.getDeliveryStatus());
        outboxEventRepository.deleteById(event.getEventId());
    }

    @TestConfiguration
    static class JsonConfiguration {
        @Bean
        ObjectMapper objectMapper() {
            return new ObjectMapper().findAndRegisterModules();
        }
    }
}
