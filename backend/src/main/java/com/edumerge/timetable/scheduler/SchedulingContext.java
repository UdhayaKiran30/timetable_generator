package com.edumerge.timetable.scheduler;

import com.edumerge.timetable.entity.*;
import java.util.*;

public record SchedulingContext(List<TeachingAssignment> assignments, List<TimeSlot> slots, List<Room> rooms, Map<Long, Set<Long>> facultySubjects, Map<String, Boolean> availability, Map<Long, Integer> divisionStrength) {

}
