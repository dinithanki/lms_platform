CREATE TABLE user_activities (
    event_id UUID NOT NULL,
    user_id BIGINT NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    course_id BIGINT NOT NULL,
    enrollment_id BIGINT NOT NULL,
    occurred_at TIMESTAMP NOT NULL,
    CONSTRAINT user_activities_pkey PRIMARY KEY (event_id)
);

CREATE INDEX user_activities_user_occurred_idx
    ON user_activities (user_id, occurred_at DESC);
