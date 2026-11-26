package com.lms.courseservice.security;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public final class OwnershipChecks {
    private OwnershipChecks() {}

    public static void requireSelfOrAdmin(LmsPrincipal principal, Long requestedUserId) {
        if (principal == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication is required");
        if (!"ADMIN".equals(principal.role()) && !principal.id().equals(requestedUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You may only access your own student data");
        }
    }

    public static void requireCourseOwner(LmsPrincipal principal, Long ownerId) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication is required");
        }
        if ("ADMIN".equals(principal.role())) {
            return;
        }
        if (!"INSTRUCTOR".equals(principal.role()) || ownerId == null || !principal.id().equals(ownerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You may only manage courses you own");
        }
    }
}
