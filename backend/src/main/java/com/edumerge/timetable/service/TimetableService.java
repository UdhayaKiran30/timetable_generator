package com.edumerge.timetable.service;

import com.edumerge.timetable.entity.*;
import com.edumerge.timetable.repository.*;
import com.edumerge.timetable.scheduler.*;
import com.edumerge.timetable.validator.TimetableValidator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
public class TimetableService {

    private final DepartmentRepository departments;
    private final DivisionRepository divisions;
    private final TeachingAssignmentRepository assignments;
    private final FacultySubjectRepository facultySubjects;
    private final FacultyAvailabilityRepository availability;
    private final RoomRepository rooms;
    private final TimeSlotRepository slots;
    private final TimetableRepository timetables;
    private final TimetableValidator validator = new TimetableValidator();

    public TimetableService(DepartmentRepository d, DivisionRepository v, TeachingAssignmentRepository a, FacultySubjectRepository f, FacultyAvailabilityRepository av, RoomRepository r, TimeSlotRepository s, TimetableRepository t) {
        departments = d;
        divisions = v;
        assignments = a;
        facultySubjects = f;
        availability = av;
        rooms = r;
        slots = s;
        timetables = t;
    }

    @Transactional
    public Map<String, Object> generate(Long dept, int semester, String year) {
        var ds = departments.findById(dept).orElseThrow(() -> new IllegalArgumentException("Department not found"));
        var as = assignments.findByDivisionDepartmentIdAndDivisionSemester(dept, semester);
        List<ConflictResult> conflicts = new ArrayList<>();
        if (as.isEmpty()) {
            return Map.of("success", false, "message", "No teaching assignments found", "conflicts", List.of(new ConflictResult("NO_ASSIGNMENTS", "HIGH", "No assignments exist for this department and semester", null, null, null)));
        }
        Map<Long, Set<Long>> fs = new HashMap<>();
        for (var a : as) {
            fs.computeIfAbsent(a.faculty.id, k -> new HashSet<>()).add(a.subject.id);
        
        }Map<String, Boolean> av = new HashMap<>();
        for (var a : availability.findAll()) {
            av.put(a.faculty.id + ":" + a.day + ":" + a.periodNumber, a.available);
        
        }Map<Long, Integer> strength = new HashMap<>();
        for (var d : divisions.findByDepartmentId(dept)) {
            if (d.semester == semester) {
                strength.put(d.id, d.studentCount);
            }
        }
        var ctx = new SchedulingContext(as, slots.findAllByOrderByDayAscPeriodNumberAsc(), rooms.findAll(), fs, av, strength);
        var solution = new BacktrackingSolver().solve(ctx, conflicts);
        if (solution.isEmpty()) {
            return Map.of("success", false, "message", "Unable to generate timetable", "conflicts", conflicts);
        }
        Timetable tt = new Timetable();
        tt.department = ds;
        tt.semester = semester;
        tt.academicYear = year;
        tt.status = TimetableStatus.DRAFT;
        tt.version = timetables.findByDepartmentIdAndSemesterAndAcademicYearOrderByVersionDesc(dept, semester, year).stream().mapToInt(x -> x.version).max().orElse(0) + 1;
        for (var p : solution.get()) {
            TimetableEntry e = new TimetableEntry();
            e.timetable = tt;
            e.division = p.assignment().division;
            e.subject = p.assignment().subject;
            e.faculty = p.assignment().faculty;
            e.room = p.room();
            e.timeSlot = p.slot();
            tt.entries.add(e);
        }
        var errors = validator.validate(tt.entries, as, fs, av);
        if (!errors.isEmpty()) {
            return Map.of("success", false, "message", "Generated candidate failed independent validation", "conflicts", errors);
        
        }timetables.save(tt);
        return Map.of("success", true, "timetable", tt, "hardConstraints", "PASSED");
    }

    @Transactional
    public List<ConflictResult> validate(Long id) {
        var tt = timetables.findById(id).orElseThrow();
        var as = assignments.findByDivisionDepartmentIdAndDivisionSemester(tt.department.id, tt.semester);
        Map<Long, Set<Long>> fs = new HashMap<>();
        for (var a : as) {
            fs.computeIfAbsent(a.faculty.id, k -> new HashSet<>()).add(a.subject.id);
        
        }Map<String, Boolean> av = new HashMap<>();
        for (var x : availability.findAll()) {
            av.put(x.faculty.id + ":" + x.day + ":" + x.periodNumber, x.available);
        
        }return validator.validate(tt.entries, as, fs, av);
    }

    @Transactional
    public Timetable publish(Long id) {
        var tt = timetables.findById(id).orElseThrow();
        timetables.findFirstByDepartmentIdAndSemesterAndAcademicYearAndStatus(tt.department.id, tt.semester, tt.academicYear, TimetableStatus.PUBLISHED).ifPresent(old -> {
            old.status = TimetableStatus.ARCHIVED;
            timetables.save(old);
        });
        tt.status = TimetableStatus.PUBLISHED;
        tt.publishedAt = java.time.Instant.now();
        return ttimablesSave(tt);
    }

    private Timetable ttimablesSave(Timetable t) {
        return timetables.save(t);
    }

    public List<Timetable> versions(Long d, int s, String y) {
        return timetables.findByDepartmentIdAndSemesterAndAcademicYearOrderByVersionDesc(d, s, y);
    }

    public List<Timetable> all() {
        return timetables.findAllByOrderByCreatedAtDesc();
    }

    public Timetable get(Long id) {
        return timetables.findById(id).orElseThrow();
    }

    @Transactional(readOnly = true)
    public Timetable getVisible(Long id, AppUser user) {
        Timetable timetable = get(id);
        if (!canView(timetable, user)) {
            throw new org.springframework.security.access.AccessDeniedException("You cannot view this timetable");
        }
        return timetable;
    }

    @Transactional(readOnly = true)
    public List<Timetable> visibleToUser(AppUser user) {
        return timetables.findAllByOrderByCreatedAtDesc().stream()
                .filter(timetable -> canView(timetable, user))
                .toList();
    }

    private boolean canView(Timetable timetable, AppUser user) {
        if (user.role == Role.ADMIN) {
            return true;
        }
        if (timetable.status != TimetableStatus.PUBLISHED) {
            return false;
        }
        if (user.role == Role.FACULTY && user.faculty != null) {
            return timetable.entries.stream().anyMatch(entry -> entry.faculty != null
                    && entry.faculty.id.equals(user.faculty.id));
        }
        if (user.role == Role.STUDENT && user.division != null) {
            return timetable.entries.stream().anyMatch(entry -> entry.division != null
                    && entry.division.id.equals(user.division.id));
        }
        return false;
    }

    @Transactional
    public void delete(Long id) {
        timetables.deleteById(id);
    }
}
