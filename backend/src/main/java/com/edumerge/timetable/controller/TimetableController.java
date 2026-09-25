package com.edumerge.timetable.controller;

import com.edumerge.timetable.dto.GenerateRequest;
import com.edumerge.timetable.entity.AppUser;
import com.edumerge.timetable.repository.AppUserRepository;
import com.edumerge.timetable.service.TimetableService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/timetables")
public class TimetableController {
    private final TimetableService s;
    private final AppUserRepository users;

    public TimetableController(TimetableService s, AppUserRepository users) {
        this.s = s;
        this.users = users;
    }

    @PostMapping("/generate")
    @PreAuthorize("hasRole('ADMIN')")
    public Object generate(@Valid @RequestBody GenerateRequest r) {
        return s.generate(r.departmentId(), r.semester(), r.academicYear());
    }

    @GetMapping("/{id}")
    public Object get(@PathVariable Long id, Authentication authentication) {
        return s.getVisible(id, currentUser(authentication));
    }

    @PostMapping("/{id}/validate")
    public Object validate(@PathVariable Long id, Authentication authentication) {
        s.getVisible(id, currentUser(authentication));
        var x = s.validate(id);
        return java.util.Map.of("success", x.isEmpty(), "conflicts", x);
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasRole('ADMIN')")
    public Object publish(@PathVariable Long id) {
        return s.publish(id);
    }

    @GetMapping
    public Object versions(
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false) String academicYear,
            Authentication authentication) {
        if (departmentId != null && semester != null && academicYear != null && !academicYear.isBlank()) {
            return s.visibleToUser(currentUser(authentication)).stream()
                    .filter(timetable -> timetable.department != null && timetable.department.id.equals(departmentId))
                    .filter(timetable -> timetable.semester == semester)
                    .filter(timetable -> academicYear.equals(timetable.academicYear))
                    .toList();
        }
        return s.visibleToUser(currentUser(authentication));
    }

    private AppUser currentUser(Authentication authentication) {
        return users.findByUsername(authentication.getName())
                .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("User account not found"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        s.delete(id);
    }
}
