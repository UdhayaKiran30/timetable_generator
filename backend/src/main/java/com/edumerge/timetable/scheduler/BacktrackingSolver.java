package com.edumerge.timetable.scheduler;

import com.edumerge.timetable.entity.*;
import java.util.*;

public class BacktrackingSolver {

    public record Placement(TeachingAssignment assignment, TimeSlot slot, Room room) {}
    
    // Internal class to group periods
    private record TaskGroup(TeachingAssignment assignment, int periodsToSchedule) {}

    private SchedulingContext ctx;
    private List<Placement> out;
    private Set<String> divBusy, facBusy, roomBusy;
    private Set<String> divSubjectDay;
    private List<ConflictResult> conflicts;

    public Optional<List<Placement>> solve(SchedulingContext c, List<ConflictResult> diagnostics) {
        ctx = c;
        out = new ArrayList<>();
        divBusy = new HashSet<>();
        facBusy = new HashSet<>();
        roomBusy = new HashSet<>();
        divSubjectDay = new HashSet<>();
        conflicts = diagnostics;
        
        List<TaskGroup> tasks = new ArrayList<>();
        for (var a : c.assignments()) {
            if (a.subject.type == SubjectType.LAB) {
                // Schedule labs as a single contiguous block
                tasks.add(new TaskGroup(a, a.requiredPeriods));
            } else {
                // Schedule theory one by one
                for (int i = 0; i < a.requiredPeriods; i++) {
                    tasks.add(new TaskGroup(a, 1));
                }
            }
        }
        
        tasks.sort(Comparator.comparingInt(this::difficulty).reversed());
        return dfs(tasks, 0).map(x -> List.copyOf(out));
    }

    private int difficulty(TaskGroup t) {
        var a = t.assignment();
        int eligible = 0;
        for (var r : ctx.rooms()) {
            if (compatible(a, r)) {
                eligible++;
            }
        }
        return (a.subject.type == SubjectType.LAB ? 1000 : 0) + (eligible == 0 ? 900 : 100) + t.periodsToSchedule;
    }

    private Optional<List<Placement>> dfs(List<TaskGroup> tasks, int i) {
        if (i == tasks.size()) {
            return Optional.of(out);
        }
        TaskGroup task = tasks.get(i);
        var a = task.assignment();
        
        // Find contiguous slots if needed
        var slots = ctx.slots();
        for (int sIdx = 0; sIdx <= slots.size() - task.periodsToSchedule; sIdx++) {
            List<TimeSlot> contiguousSlots = new ArrayList<>();
            boolean validBlock = true;
            Day currentDay = slots.get(sIdx).day;
            
            for (int offset = 0; offset < task.periodsToSchedule; offset++) {
                TimeSlot s = slots.get(sIdx + offset);
                if (s.day != currentDay) {
                    validBlock = false;
                    break;
                }
                contiguousSlots.add(s);
            }
            
            if (!validBlock) continue;
            
            for (var r : ctx.rooms()) {
                if (canPlaceBlock(a, contiguousSlots, r)) {
                    // Place
                    List<String> toRemoveD = new ArrayList<>(), toRemoveF = new ArrayList<>(), toRemoveR = new ArrayList<>();
                    boolean isTheory = a.subject.type == SubjectType.THEORY;
                    String dsdKey = a.division.id + ":" + a.subject.id + ":" + currentDay;
                    
                    for (var s : contiguousSlots) {
                        out.add(new Placement(a, s, r));
                        String dk = key(a.division.id, s.id), fk = key(a.faculty.id, s.id), rk = key(r.id, s.id);
                        divBusy.add(dk); facBusy.add(fk); roomBusy.add(rk);
                        toRemoveD.add(dk); toRemoveF.add(fk); toRemoveR.add(rk);
                    }
                    if (isTheory) divSubjectDay.add(dsdKey);
                    
                    var ok = dfs(tasks, i + 1);
                    if (ok.isPresent()) return ok;
                    
                    // Backtrack
                    for (int k = 0; k < contiguousSlots.size(); k++) {
                        out.remove(out.size() - 1);
                    }
                    toRemoveD.forEach(divBusy::remove);
                    toRemoveF.forEach(facBusy::remove);
                    toRemoveR.forEach(roomBusy::remove);
                    if (isTheory) divSubjectDay.remove(dsdKey);
                }
            }
        }
        
        if (i < 3) {
            conflicts.add(new ConflictResult("NO_COMPATIBLE_SLOT", "HIGH", "No compatible slot/room found for " + a.subject.name + " / " + a.division.name, a.faculty.id, a.subject.id, a.division.id));
        }
        return Optional.empty();
    }

    private boolean canPlaceBlock(TeachingAssignment a, List<TimeSlot> slots, Room r) {
        if (!compatible(a, r)) return false;
        
        Day day = slots.get(0).day;
        if (a.subject.type == SubjectType.THEORY) {
            if (divSubjectDay.contains(a.division.id + ":" + a.subject.id + ":" + day)) {
                return false; // Already has this theory subject on this day
            }
        }
        
        for (var s : slots) {
            if (divBusy.contains(key(a.division.id, s.id)) || 
                facBusy.contains(key(a.faculty.id, s.id)) || 
                roomBusy.contains(key(r.id, s.id))) {
                return false;
            }
            Boolean av = ctx.availability().get(a.faculty.id + ":" + s.day + ":" + s.periodNumber);
            if (av != null && !av) return false;
        }
        return true;
    }

    private boolean compatible(TeachingAssignment a, Room r) {
        int expectedStrength = (ctx.divisionStrength() != null && a.division != null)
                ? ctx.divisionStrength().getOrDefault(a.division.id, a.division.studentCount)
                : (a.division != null ? a.division.studentCount : 0);
        return r.capacity >= expectedStrength && 
               (a.subject.type == SubjectType.LAB ? r.type == RoomType.LAB : r.type == RoomType.CLASSROOM || r.type == RoomType.LAB) && 
               ctx.facultySubjects().getOrDefault(a.faculty.id, Set.of()).contains(a.subject.id);
    }

    private String key(Long a, Long b) {
        return a + ":" + b;
    }
}
