CREATE TABLE users (
    id BIGINT NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    role VARCHAR(255),
    phone VARCHAR(255),
    bio TEXT,
    profile_image_url VARCHAR(255),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email)
);
