package com.edumerge.timetable;

import com.edumerge.timetable.entity.*;
import com.edumerge.timetable.scheduler.*;
import org.junit.jupiter.api.Test;
import java.time.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

class BacktrackingSolverTest {

    @Test
    void schedulesNonConflictingAssignment() {
        Department d = new Department();
        d.id = 1L;
        Division div = new Division();
        div.id = 1L;
        div.department = d;
        div.name = "A";
        div.studentCount = 30;
        Faculty f = new Faculty();
        f.id = 1L;
        Subject s = new Subject();
        s.id = 1L;
        s.name = "Java";
        s.type = SubjectType.THEORY;
        TeachingAssignment a = new TeachingAssignment();
        a.id = 1L;
        a.division = div;
        a.faculty = f;
        a.subject = s;
        a.requiredPeriods = 1;
        Room r = new Room();
        r.id = 1L;
        r.capacity = 40;
        r.type = RoomType.CLASSROOM;
        TimeSlot ts = new TimeSlot();
        ts.id = 1L;
        ts.day = Day.MONDAY;
        ts.periodNumber = 1;
        var ctx = new SchedulingContext(List.of(a), List.of(ts), List.of(r), Map.of(1L, Set.of(1L)), Map.of("1:MONDAY:1", true), Map.of(1L, 30));
        var result = new BacktrackingSolver().solve(ctx, new ArrayList<>());
        assertTrue(result.isPresent());
        assertEquals(1, result.get().size());
    }
}
