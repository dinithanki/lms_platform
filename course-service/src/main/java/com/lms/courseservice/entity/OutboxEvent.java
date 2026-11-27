package com.lms.courseservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "kafka_outbox")
public class OutboxEvent {

    public enum DeliveryStatus { PENDING, PUBLISHED }

    @Id
    @Column(name = "event_id", nullable = false, updatable = false)
    private UUID eventId;

    @Column(name = "event_type", nullable = false, length = 100)
    private String eventType;

    @Column(name = "topic", nullable = false, length = 255)
    private String topic;

    @Column(name = "payload", nullable = false, columnDefinition = "text")
    private String payload;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_status", nullable = false, length = 20)
    private DeliveryStatus deliveryStatus;

    @Column(name = "attempt_count", nullable = false)
    private int attemptCount;

    @Column(name = "next_attempt_at", nullable = false)
    private LocalDateTime nextAttemptAt;

    @Column(name = "last_error", columnDefinition = "text")
    private String lastError;

    public static OutboxEvent pending(UUID eventId, String eventType, String topic, String payload) {
        OutboxEvent event = new OutboxEvent();
        event.eventId = eventId;
        event.eventType = eventType;
        event.topic = topic;
        event.payload = payload;
        event.createdAt = LocalDateTime.now();
        event.deliveryStatus = DeliveryStatus.PENDING;
        event.nextAttemptAt = event.createdAt;
        event.attemptCount = 0;
        return event;
    }

    public void markPublished() {
        this.deliveryStatus = DeliveryStatus.PUBLISHED;
        this.publishedAt = LocalDateTime.now();
        this.lastError = null;
    }

    public void recordFailure(Throwable failure) {
        this.attemptCount++;
        long delaySeconds = Math.min(300L, 1L << Math.min(this.attemptCount, 8));
        this.nextAttemptAt = LocalDateTime.now().plusSeconds(delaySeconds);
        String message = failure.getMessage();
        this.lastError = message == null ? failure.getClass().getSimpleName() : message.substring(0, Math.min(2000, message.length()));
    }
}
