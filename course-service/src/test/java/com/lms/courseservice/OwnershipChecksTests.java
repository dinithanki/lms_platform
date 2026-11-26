package com.lms.courseservice;

import com.lms.courseservice.security.LmsPrincipal;
import com.lms.courseservice.security.OwnershipChecks;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;

class OwnershipChecksTests {
    @Test
    void studentCanAccessOwnDataButNotAnotherStudentsData() {
        LmsPrincipal student = new LmsPrincipal(10L, "student@example.test", "STUDENT");
        assertDoesNotThrow(() -> OwnershipChecks.requireSelfOrAdmin(student, 10L));
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> OwnershipChecks.requireSelfOrAdmin(student, 11L));
        assertEquals(403, exception.getStatusCode().value());
    }

    @Test
    void adminCanAccessStudentData() {
        assertDoesNotThrow(() -> OwnershipChecks.requireSelfOrAdmin(
                new LmsPrincipal(1L, "admin@example.test", "ADMIN"), 10L));
    }

    @Test
    void instructorCanManageOwnCourse() {
        assertDoesNotThrow(() -> OwnershipChecks.requireCourseOwner(
                new LmsPrincipal(22L, "instructor@example.test", "INSTRUCTOR"), 22L));
    }

    @Test
    void instructorCannotManageAnotherInstructorsCourse() {
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> OwnershipChecks.requireCourseOwner(
                        new LmsPrincipal(22L, "instructor@example.test", "INSTRUCTOR"), 23L));
        assertEquals(403, exception.getStatusCode().value());
    }

    @Test
    void instructorCannotManageLegacyCourseWithoutOwner() {
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> OwnershipChecks.requireCourseOwner(
                        new LmsPrincipal(22L, "instructor@example.test", "INSTRUCTOR"), null));
        assertEquals(403, exception.getStatusCode().value());
    }

    @Test
    void adminCanManageAnyCourse() {
        assertDoesNotThrow(() -> OwnershipChecks.requireCourseOwner(
                new LmsPrincipal(1L, "admin@example.test", "ADMIN"), 23L));
    }
}
