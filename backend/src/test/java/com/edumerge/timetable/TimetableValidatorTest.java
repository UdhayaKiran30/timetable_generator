package com.edumerge.timetable;

import com.edumerge.timetable.entity.*;
import com.edumerge.timetable.validator.*;
import java.util.*;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class TimetableValidatorTest {

    @Test
    void detectsRoomConflict() {
        Department d = new Department();
        d.id = 1L;
        Division v1 = new Division();
        v1.id = 1L;
        v1.department = d;
        v1.studentCount = 20;
        Division v2 = new Division();
        v2.id = 2L;
        v2.department = d;
        v2.studentCount = 20;
        Faculty f = new Faculty();
        f.id = 1L;
        Subject s = new Subject();
        s.id = 1L;
        s.name = "Java";
        s.type = SubjectType.THEORY;
        Room r = new Room();
        r.id = 1L;
        r.capacity = 50;
        r.type = RoomType.CLASSROOM;
        TimeSlot t = new TimeSlot();
        t.id = 1L;
        t.day = Day.MONDAY;
        t.periodNumber = 1;
        TimetableEntry e1 = entry(v1, f, s, r, t), e2 = entry(v2, f, s, r, t);
        var errors = new TimetableValidator().validate(List.of(e1, e2), List.of(), Map.of(1L, Set.of(1L)), Map.of("1:MONDAY:1", true));
        assertTrue(errors.stream().anyMatch(x -> x.type().equals("DIVISION_CONFLICT") || x.type().equals("FACULTY_CONFLICT") || x.type().equals("ROOM_CONFLICT")));
    }

    static TimetableEntry entry(Division d, Faculty f, Subject s, Room r, TimeSlot t) {
        TimetableEntry e = new TimetableEntry();
        e.division = d;
        e.faculty = f;
        e.subject = s;
        e.room = r;
        e.timeSlot = t;
        return e;
    }
}
