# LMS Security Phase 1: JWT and service authorization

All backend services now require an explicitly configured shared JWT secret. Set the same `LMS_JWT_SECRET` value in the Gateway, Auth Service, User Service, Course Service, and Quiz Service. It is used as the raw UTF-8 HMAC key and must be at least 32 bytes. The Auth Service issues HS256 tokens; all consumers verify the signature, expiration, required identity claims, and HS256 algorithm.

Auth Service to User Service profile creation and role synchronization use `LMS_AUTH_SERVICE_TOKEN`. Quiz Service to Course Service quiz-result persistence uses a separate `LMS_QUIZ_SERVICE_TOKEN`. Each token must be at least 32 UTF-8 bytes, and its value must match between the caller and receiving service. Missing JWT and internal-service credentials fail closed; JWT consumers and internal-token filters also reject too-short configuration during startup.

For a local PowerShell session, generate values and keep them in that session while starting all services:

```powershell
$env:LMS_JWT_SECRET = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
$env:LMS_AUTH_SERVICE_TOKEN = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
$env:LMS_QUIZ_SERVICE_TOKEN = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
```

Use managed secret storage in deployed environments. Do not commit generated values. The internal service tokens are independent from the JWT signing key and from each other.

Course catalog reads (`GET /courses`, `GET /courses/{id}`, and `GET /courses/{id}/modules`) remain public. Course and module mutations require ADMIN. Progress, enrollment, quiz-result reads, and certificates require an authenticated identity and are restricted to the student named by the token, except that ADMIN may access another student's data. Quiz administration and question authoring require ADMIN. Students can access published, unlocked quizzes, submit only for their own account, and read only their own attempt history. Correct answers are omitted from student question responses.

The existing Course Service API does not define a module-deletion endpoint. No endpoint was added in this phase.

## Tests

Run each module's tests from its directory with Java 17 and Maven Wrapper:

```powershell
cd api-gateway; .\mvnw.cmd test
cd auth-service; .\mvnw.cmd test
cd user-service; .\mvnw.cmd test
cd course-service; .\mvnw.cmd test
cd quiz-service; .\mvnw.cmd test
```

The existing Spring Boot context tests connect to each service's configured PostgreSQL database. The existing certificate rendering test writes a PDF under Course Service's `target` directory.
