package com.lms.courseservice.security;

public enum Role {
    ADMIN, INSTRUCTOR, STUDENT;

    public static boolean isInstructor(String role) {
        return role != null && role.equalsIgnoreCase(INSTRUCTOR.name());
    }

    public static boolean isAdmin(String role) {
        return role != null && role.equalsIgnoreCase(ADMIN.name());
    }

    public static boolean isStudent(String role) {
        return role != null && role.equalsIgnoreCase(STUDENT.name());
    }
}
