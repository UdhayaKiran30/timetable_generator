package com.edumerge.timetable.controller;

import com.edumerge.timetable.dto.*;
import com.edumerge.timetable.entity.AppUser;
import com.edumerge.timetable.repository.AppUserRepository;
import com.edumerge.timetable.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AppUserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthController(AppUserRepository u, PasswordEncoder e, JwtService j) {
        users = u;
        encoder = e;
        jwt = j;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest r) {
        var u = users.findByUsername(r.username()).orElse(null);
        if (u == null || !encoder.matches(r.password(), u.passwordHash)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Invalid username or password"));
        }
        
        String displayName = u.username;
        if (u.faculty != null && u.faculty.name != null) {
            displayName = u.faculty.name;
        }

        return ResponseEntity.ok(new LoginResponse(
                jwt.generate(u.username, u.role.name()),
                u.role.name(),
                u.username,
                displayName
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Not authenticated"));
        }

        var u = users.findByUsername(authentication.getName()).orElse(null);
        if (u == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "User account not found"));
        }

        String displayName = u.username;
        Long facultyId = null;
        String facultyName = null;
        Long divisionId = null;
        String divisionName = null;
        Long departmentId = null;
        String departmentName = null;

        if (u.faculty != null) {
            facultyId = u.faculty.id;
            facultyName = u.faculty.name;
            displayName = u.faculty.name;
            if (u.faculty.department != null) {
                departmentId = u.faculty.department.id;
                departmentName = u.faculty.department.name;
            }
        } else if (u.division != null) {
            divisionId = u.division.id;
            divisionName = u.division.name;
            if (u.division.department != null) {
                departmentId = u.division.department.id;
                departmentName = u.division.department.name;
            }
        }

        return ResponseEntity.ok(new AuthDtos.UserProfileResponse(
                u.id,
                u.username,
                u.role != null ? u.role.name() : "USER",
                displayName,
                facultyId,
                facultyName,
                divisionId,
                divisionName,
                departmentId,
                departmentName
        ));
    }
}
