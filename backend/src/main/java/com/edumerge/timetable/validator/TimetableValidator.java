package com.edumerge.timetable.validator;

import com.edumerge.timetable.entity.*;
import com.edumerge.timetable.scheduler.*;
import java.util.*;

public class TimetableValidator {

    public List<ConflictResult> validate(List<TimetableEntry> entries, List<TeachingAssignment> assignments, Map<Long, Set<Long>> facultySubjects, Map<String, Boolean> availability) {
        List<ConflictResult> e = new ArrayList<>();
        Set<String> d = new HashSet<>(), f = new HashSet<>(), r = new HashSet<>();
        Map<String, Integer> counts = new HashMap<>();
        for (var x : entries) {
            if (!d.add(x.division.id + ":" + x.timeSlot.id)) {
                e.add(c("DIVISION_CONFLICT", "HIGH", "Division has multiple subjects in the same slot", x));
            }
            if (!f.add(x.faculty.id + ":" + x.timeSlot.id)) {
                e.add(c("FACULTY_CONFLICT", "HIGH", "Faculty teaches multiple divisions in the same slot", x));
            }
            if (!r.add(x.room.id + ":" + x.timeSlot.id)) {
                e.add(c("ROOM_CONFLICT", "HIGH", "Room is double-booked", x));
            }
            if (x.room.capacity < x.division.studentCount) {
                e.add(c("ROOM_CAPACITY", "HIGH", "Room capacity is insufficient", x));
            }
            if (x.subject.type == SubjectType.LAB && x.room.type != RoomType.LAB) {
                e.add(c("ROOM_TYPE", "HIGH", "Lab requires a LAB room", x));
            }
            if (!facultySubjects.getOrDefault(x.faculty.id, Set.of()).contains(x.subject.id)) {
                e.add(c("INVALID_FACULTY_SUBJECT", "HIGH", "Faculty is not qualified for this subject", x));
            }
            if (Boolean.FALSE.equals(availability.get(x.faculty.id + ":" + x.timeSlot.day + ":" + x.timeSlot.periodNumber))) {
                e.add(c("FACULTY_AVAILABILITY", "HIGH", "Faculty is unavailable in this slot", x));
            }
            counts.merge(x.division.id + ":" + x.subject.id, 1, Integer::sum);
        }
        for (var a : assignments) {
            String k = a.division.id + ":" + a.subject.id;
            int found = counts.getOrDefault(k, 0);
            if (found != a.requiredPeriods) {
                e.add(new ConflictResult("REQUIRED_PERIODS", "HIGH", "Expected " + a.requiredPeriods + " periods for " + a.subject.name + " but found " + found, a.faculty.id, a.subject.id, a.division.id));
        
            }}
        return e;
    }

    private ConflictResult c(String t, String s, String m, TimetableEntry x) {
        return new ConflictResult(t, s, m, x.faculty.id, x.subject.id, x.division.id);
    }
}
