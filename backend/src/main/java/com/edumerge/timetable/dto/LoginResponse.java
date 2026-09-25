package com.edumerge.timetable.dto;

public record LoginResponse(String token, String role, String username, String displayName) {
    public LoginResponse(String token, String role, String username) {
        this(token, role, username, username);
    }
}
