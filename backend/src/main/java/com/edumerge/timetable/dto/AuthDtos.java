package com.edumerge.timetable.dto;

public final class AuthDtos {
    private AuthDtos() {
    }

    public record UserProfileResponse(
            Long id,
            String username,
            String role,
            String displayName,
            Long facultyId,
            String facultyName,
            Long divisionId,
            String divisionName,
            Long departmentId,
            String departmentName
    ) {}
}
