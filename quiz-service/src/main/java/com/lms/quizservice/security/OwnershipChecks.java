package com.lms.quizservice.security;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public final class OwnershipChecks {
    private OwnershipChecks() {}

    public static void requireSelfOrAdmin(LmsPrincipal principal, Long requestedUserId) {
        if (principal == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication is required");
        if (!"ADMIN".equals(principal.role()) && !principal.id().equals(requestedUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You may only access your own quiz data");
        }
    }
}
