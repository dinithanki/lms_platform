# LMS Platform Monorepo

A structured Learning Management System (LMS) monorepo with clear separation of frontend, backend microservices, infrastructure, and documentation.

## Project Status

In active development.

## New Structured Layout

```text
lms_platform/
|
|-- README.md
|-- backend/
|   |-- README.md
|   `-- services/
|       |-- api-gateway/
|       |-- auth-service/
|       |-- course-service/
|       |-- enrollment-service/
|       `-- progress-service/
|-- frontend/
|   |-- README.md
|   |-- public/
|   |-- src/
|   |-- package.json
|   `-- vite.config.js
|-- infrastructure/
|   |-- README.md
|   `-- docker/
|       `-- docker-compose.yml
|-- docs/
|   |-- architecture.md
|   |-- api-specs.md
|   `-- database-design.md
|-- scripts/
|   `-- README.md
`-- shared/
    `-- README.md
```

## Why This Structure

- backend: all Java microservices grouped in one place
- frontend: React app isolated from backend concerns
- infrastructure: deployment and container orchestration files
- docs: architecture, API, and database documentation
- scripts: setup and automation scripts
- shared: reusable contracts/utilities for cross-service usage

## Services

- api-gateway: single entry point for client requests
- auth-service: authentication and authorization
- course-service: course management
- enrollment-service: learner enrollment flows
- progress-service: learner progress tracking

## Tech Stack

Backend:

- Java 17+
- Spring Boot
- Maven

Frontend:

- React
- Vite

Infrastructure:

- Docker
- Docker Compose

## Local Development

### Prerequisites

- Java 17 or newer
- Maven 3.9 or newer
- Node.js 18 or newer
- npm 9 or newer
- Docker Desktop

### Run with Docker Compose

```bash
cd infrastructure/docker
docker compose up --build
```

Stop:

```bash
cd infrastructure/docker
docker compose down
```

### Run Backend Services Locally

```bash
cd backend/services/api-gateway && mvn spring-boot:run
cd backend/services/auth-service && mvn spring-boot:run
cd backend/services/course-service && mvn spring-boot:run
cd backend/services/enrollment-service && mvn spring-boot:run
cd backend/services/progress-service && mvn spring-boot:run
```

### Run Frontend Locally

```bash
cd frontend
npm install
npm run dev
```

## Documentation

- docs/architecture.md
- docs/api-specs.md
- docs/database-design.md

## Next Recommended Improvements

- Add environment files per service
- Add CI workflow for backend and frontend
- Add root Makefile for common commands
- Add integration tests for gateway routes

## License

Add a license file before publishing publicly (for example, MIT).
