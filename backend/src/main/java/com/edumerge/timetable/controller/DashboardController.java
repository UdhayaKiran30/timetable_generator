package com.edumerge.timetable.controller;

import com.edumerge.timetable.repository.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    final DepartmentRepository d;
    final DivisionRepository v;
    final FacultyRepository f;
    final SubjectRepository s;
    final RoomRepository r;

    public DashboardController(DepartmentRepository d, DivisionRepository v, FacultyRepository f, SubjectRepository s,
            RoomRepository r) {
        this.d = d;
        this.v = v;
        this.f = f;
        this.s = s;
        this.r = r;
    }

    @GetMapping
    public Object get() {
        return Map.of("departments", d.count(), "divisions", v.count(), "faculty", f.count(), "subjects", s.count(),
                "rooms", r.count());
    }
}
