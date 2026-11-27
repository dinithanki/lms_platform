package com.lms.courseservice.repository;

import com.lms.courseservice.entity.OutboxEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface OutboxEventRepository extends JpaRepository<OutboxEvent, UUID> {

    @Query(value = "SELECT * FROM kafka_outbox " +
            "WHERE delivery_status = 'PENDING' AND next_attempt_at <= :now " +
            "ORDER BY created_at LIMIT :batchSize FOR UPDATE SKIP LOCKED", nativeQuery = true)
    List<OutboxEvent> lockPendingEvents(@Param("now") LocalDateTime now,
                                        @Param("batchSize") int batchSize);
}
