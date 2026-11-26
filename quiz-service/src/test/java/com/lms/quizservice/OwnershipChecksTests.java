package com.lms.quizservice;

import com.lms.quizservice.security.LmsPrincipal;
import com.lms.quizservice.security.OwnershipChecks;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;

class OwnershipChecksTests {
    @Test
    void studentCannotReadOrSubmitForAnotherStudent() {
        LmsPrincipal student = new LmsPrincipal(10L, "student@example.test", "STUDENT");
        assertDoesNotThrow(() -> OwnershipChecks.requireSelfOrAdmin(student, 10L));
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> OwnershipChecks.requireSelfOrAdmin(student, 11L));
        assertEquals(403, exception.getStatusCode().value());
    }
}
