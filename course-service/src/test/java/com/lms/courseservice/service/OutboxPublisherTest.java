package com.lms.courseservice.service;

import com.lms.courseservice.entity.OutboxEvent;
import com.lms.courseservice.repository.OutboxEventRepository;
import org.junit.jupiter.api.Test;
import org.springframework.kafka.core.KafkaTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class OutboxPublisherTest {

    @SuppressWarnings("unchecked")
    private final KafkaTemplate<String, String> kafkaTemplate = mock(KafkaTemplate.class);
    private final OutboxEventRepository repository = mock(OutboxEventRepository.class);
    private final OutboxPublisher publisher = new OutboxPublisher(repository, kafkaTemplate);

    @Test
    void successfulKafkaAcknowledgementMarksEventPublished() throws Exception {
        OutboxEvent event = pendingEvent();
        when(repository.lockPendingEvents(any(), anyInt())).thenReturn(List.of(event));
        when(kafkaTemplate.send(eq(event.getTopic()), eq(event.getEventId().toString()), eq(event.getPayload())))
                .thenReturn(CompletableFuture.completedFuture(null));

        publisher.publishPendingEvents();

        assertEquals(OutboxEvent.DeliveryStatus.PUBLISHED, event.getDeliveryStatus());
        assertNotNull(event.getPublishedAt());
    }

    @Test
    void failedKafkaDeliveryLeavesEventPendingAndSchedulesRetry() throws Exception {
        OutboxEvent event = pendingEvent();
        when(repository.lockPendingEvents(any(), anyInt())).thenReturn(List.of(event));
        when(kafkaTemplate.send(eq(event.getTopic()), eq(event.getEventId().toString()), eq(event.getPayload())))
                .thenReturn(CompletableFuture.failedFuture(new RuntimeException("broker unavailable")));

        publisher.publishPendingEvents();

        assertEquals(OutboxEvent.DeliveryStatus.PENDING, event.getDeliveryStatus());
        assertEquals(1, event.getAttemptCount());
        assertNotNull(event.getNextAttemptAt());
        assertEquals("broker unavailable", event.getLastError());
    }

    private OutboxEvent pendingEvent() {
        return OutboxEvent.pending(UUID.randomUUID(), "StudentEnrolled", "lms.course.student-enrolled", "{\"ok\":true}");
    }
}
