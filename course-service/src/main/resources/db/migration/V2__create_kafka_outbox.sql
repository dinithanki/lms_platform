CREATE TABLE kafka_outbox (
    event_id UUID NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    topic VARCHAR(255) NOT NULL,
    payload TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    published_at TIMESTAMP,
    delivery_status VARCHAR(20) NOT NULL,
    attempt_count INTEGER NOT NULL DEFAULT 0,
    next_attempt_at TIMESTAMP NOT NULL,
    last_error TEXT,
    CONSTRAINT kafka_outbox_pkey PRIMARY KEY (event_id),
    CONSTRAINT kafka_outbox_delivery_status_check CHECK (delivery_status IN ('PENDING', 'PUBLISHED'))
);

CREATE INDEX kafka_outbox_pending_idx
    ON kafka_outbox (next_attempt_at, created_at)
    WHERE delivery_status = 'PENDING';
