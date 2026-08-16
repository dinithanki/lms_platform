# LearnSphere LMS Platform

LearnSphere is an ongoing Learning Management System built as a microservices-based platform. It combines a React/Vite frontend with a set of Spring Boot backend services to support authentication, course management, quizzes, user administration, and notifications.

> Status: This project is actively under development. Some features, UI flows, and backend integrations may still be evolving.

## Overview

This repository contains the full LMS platform split into multiple services so each domain can evolve independently while still working together through an API gateway.

The platform is designed for:

- Students who want to browse courses, enroll, track learning progress, take quizzes, and earn certificates.
- Instructors who create and manage course content.
- Administrators who manage users, roles, and platform data.

## Repository Structure

- `api-gateway/` - Entry point for backend requests and routing to the internal services.
- `auth-service/` - Authentication and authorization service.
- `user-service/` - User profile and account-related service.
- `course-service/` - Course, module, enrollment, and course-content management.
- `quiz-service/` - Quiz, assessment, and certificate-related functionality.
- `notification-service/` - Notification delivery and messaging support.
- `lms-frontend/` - React/Vite user interface for the LMS.

## Key Features

### Authentication and Access Control

- Login and registration flows.
- Token-based session handling.
- Role-based route protection.
- Global unauthorized handling in the frontend.

### Student Experience

- Browse the course catalog.
- Enroll in available courses.
- View enrolled courses and progress.
- Access quiz and certificate-related features.
- Open course details and learning content.

### Instructor Experience

- Create new courses.
- Manage course content.
- Remove courses when needed.

### Admin Experience

- View platform dashboard information.
- Manage users and roles.
- Delete users and maintain platform hygiene.

### Platform Capabilities

- Microservices architecture.
- API gateway-based routing.
- Modular backend services for clear separation of concerns.
- Responsive frontend UI built with modern React patterns.

## Tech Stack

### Frontend

- React 19
- Vite
- React Router
- Axios
- Zustand
- Tailwind CSS
- React Player

### Backend

- Java
- Spring Boot
- Maven
- REST APIs

## Frontend Application

The frontend lives in `lms-frontend/` and provides the main user experience for the LMS.

### Frontend Pages

- Login and registration
- Dashboard
- Courses catalog
- Course details
- My courses
- Profile
- Not found page

### Frontend Behavior

- Uses protected routes for authenticated pages.
- Separates student-only routes from general authenticated routes.
- Bootstraps authentication on app load.
- Replaces the native alert flow with a custom dialog experience.

## Backend Services

Each backend service is self-contained and has its own Maven wrapper and build configuration.

### `api-gateway`

Routes requests to the appropriate internal service.

### `auth-service`

Handles authentication, login, registration, and token-related logic.

### `user-service`

Manages user profiles and user-facing account data.

### `course-service`

Manages course data, enrollment, and course-related content.

### `quiz-service`

Handles quizzes, quiz results, and certificate issuance or retrieval.

### `notification-service`

Supports notification workflows and messaging.

## Prerequisites

- Node.js 18+ recommended
- Java 17+ recommended
- Maven 3.9+ or the included Maven wrapper
- A browser for the frontend UI

## Getting Started

### 1. Start the backend services

Each backend service can be started from its own folder.

```bash
cd api-gateway
./mvnw spring-boot:run
```

Repeat the same pattern for the other services as needed:

```bash
cd auth-service
./mvnw spring-boot:run

cd user-service
./mvnw spring-boot:run

cd course-service
./mvnw spring-boot:run

cd quiz-service
./mvnw spring-boot:run

cd notification-service
./mvnw spring-boot:run
```

If you are on Windows and prefer the wrapper script:

```bash
mvnw.cmd spring-boot:run
```

### 2. Start the frontend

```bash
cd lms-frontend
npm install
npm run dev
```

### 3. Open the application

By default, Vite runs the frontend on the local development server shown in the terminal output. Make sure the backend services and gateway are running before signing in.

## Build Commands

### Frontend

```bash
cd lms-frontend
npm run build
npm run lint
npm run preview
```

### Backend

```bash
cd api-gateway && ./mvnw test
cd auth-service && ./mvnw test
cd user-service && ./mvnw test
cd course-service && ./mvnw test
cd quiz-service && ./mvnw test
cd notification-service && ./mvnw test
```

## Configuration

Configuration is service-specific.

- Spring Boot services use `application.properties` or `application.yml` under each service's `src/main/resources` folder.
- The frontend may require environment variables depending on the API endpoints used in the stores and service layer.

If you change service ports or gateway URLs, update the corresponding frontend API configuration so all requests continue to resolve correctly.

## Development Notes

- The project is structured as a microservices LMS rather than a monolithic app.
- The frontend currently focuses on a polished dashboard-driven learning experience.
- UI and backend behavior may continue to change as development progresses.
- Some areas may still be incomplete while the platform is being actively built out.

## Suggested Roadmap

- Complete remaining course and quiz workflows.
- Expand notification delivery and user messaging.
- Add stronger test coverage across services.
- Document environment variables and service ports once they are finalized.
- Add deployment instructions when the release pipeline is ready.

## Contributing

This repository is an ongoing project. If you are extending it, keep changes modular, document any new service contracts, and update the README when setup steps or service responsibilities change.

## License

No license has been specified yet.

---

For frontend-specific notes, see `lms-frontend/README.md`.
