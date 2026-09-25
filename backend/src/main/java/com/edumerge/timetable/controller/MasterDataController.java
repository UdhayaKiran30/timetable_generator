package com.edumerge.timetable.controller;

import com.edumerge.timetable.entity.*;
import com.edumerge.timetable.repository.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.*;

@RestController
@RequestMapping("/api")
public class MasterDataController {
    final DepartmentRepository d;
    final DivisionRepository v;
    final FacultyRepository f;
    final SubjectRepository s;
    final RoomRepository r;
    final TimeSlotRepository t;
    final FacultyAvailabilityRepository a;
    final TeachingAssignmentRepository ta;

    public MasterDataController(DepartmentRepository d, DivisionRepository v, FacultyRepository f, SubjectRepository s,
            RoomRepository r, TimeSlotRepository t, FacultyAvailabilityRepository a, TeachingAssignmentRepository ta) {
        this.d = d;
        this.v = v;
        this.f = f;
        this.s = s;
        this.r = r;
        this.t = t;
        this.a = a;
        this.ta = ta;
    }

    @GetMapping("/departments")
    public Object departments() {
        return d.findAll();
    }

    @PostMapping("/departments")
    @PreAuthorize("hasRole('ADMIN')")
    public Department departments(@RequestBody Department x) {
        x.id = null;
        return d.save(x);
    }

    @PutMapping("/departments/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Department departmentUpdate(@PathVariable Long id, @RequestBody Department x) {
        x.id = id;
        return d.save(x);
    }

    @DeleteMapping("/departments/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void departmentDelete(@PathVariable Long id) {
        d.deleteById(id);
    }

    @GetMapping("/divisions")
    public Object divisions() {
        return v.findAll();
    }

    @PostMapping("/divisions")
    @PreAuthorize("hasRole('ADMIN')")
    public Division divisions(@RequestBody Division x) {
        x.id = null;
        return v.save(x);
    }

    @PutMapping("/divisions/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Division divisionUpdate(@PathVariable Long id, @RequestBody Division x) {
        x.id = id;
        return v.save(x);
    }

    @DeleteMapping("/divisions/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void divisionDelete(@PathVariable Long id) {
        v.deleteById(id);
    }

    @GetMapping("/faculty")
    public Object faculty() {
        return f.findAll();
    }

    @PostMapping("/faculty")
    @PreAuthorize("hasRole('ADMIN')")
    public Faculty faculty(@RequestBody Faculty x) {
        x.id = null;
        return f.save(x);
    }

    @PutMapping("/faculty/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Faculty facultyUpdate(@PathVariable Long id, @RequestBody Faculty x) {
        x.id = id;
        return f.save(x);
    }

    @DeleteMapping("/faculty/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void facultyDelete(@PathVariable Long id) {
        f.deleteById(id);
    }

    @GetMapping("/subjects")
    public Object subjects() {
        return s.findAll();
    }

    @PostMapping("/subjects")
    @PreAuthorize("hasRole('ADMIN')")
    public Subject subjects(@RequestBody Subject x) {
        x.id = null;
        return s.save(x);
    }

    @PutMapping("/subjects/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Subject subjectUpdate(@PathVariable Long id, @RequestBody Subject x) {
        x.id = id;
        return s.save(x);
    }

    @DeleteMapping("/subjects/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void subjectDelete(@PathVariable Long id) {
        s.deleteById(id);
    }

    @GetMapping("/rooms")
    public Object rooms() {
        return r.findAll();
    }

    @PostMapping("/rooms")
    @PreAuthorize("hasRole('ADMIN')")
    public Room rooms(@RequestBody Room x) {
        x.id = null;
        return r.save(x);
    }

    @PutMapping("/rooms/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Room roomUpdate(@PathVariable Long id, @RequestBody Room x) {
        x.id = id;
        return r.save(x);
    }

    @DeleteMapping("/rooms/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void roomDelete(@PathVariable Long id) {
        r.deleteById(id);
    }

    @GetMapping("/time-slots")
    public Object slots() {
        return t.findAllByOrderByDayAscPeriodNumberAsc();
    }

    @PostMapping("/time-slots")
    @PreAuthorize("hasRole('ADMIN')")
    public TimeSlot slots(@RequestBody TimeSlot x) {
        x.id = null;
        return t.save(x);
    }

    @DeleteMapping("/time-slots/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void slotDelete(@PathVariable Long id) {
        t.deleteById(id);
    }

    @GetMapping("/faculty-availability")
    public Object availability() {
        return a.findAll();
    }

    @PostMapping("/faculty-availability")
    @PreAuthorize("hasRole('ADMIN')")
    public FacultyAvailability availability(@RequestBody FacultyAvailability x) {
        x.id = null;
        return a.save(x);
    }

    @DeleteMapping("/faculty-availability/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void availabilityDelete(@PathVariable Long id) {
        a.deleteById(id);
    }

    @GetMapping("/teaching-assignments")
    public Object assignments() {
        return ta.findAll();
    }

    @PostMapping("/teaching-assignments")
    @PreAuthorize("hasRole('ADMIN')")
    public TeachingAssignment assignments(@RequestBody TeachingAssignment x) {
        x.id = null;
        return ta.save(x);
    }

    @DeleteMapping("/teaching-assignments/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void assignmentDelete(@PathVariable Long id) {
        ta.deleteById(id);
    }
}
