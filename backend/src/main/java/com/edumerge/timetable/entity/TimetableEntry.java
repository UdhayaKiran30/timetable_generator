package com.edumerge.timetable.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "timetable_entry", indexes = {
    @Index(name = "idx_entry_slot", columnList = "time_slot_id"),
    @Index(name = "idx_entry_division", columnList = "division_id"),
    @Index(name = "idx_entry_faculty", columnList = "faculty_id")})
public class TimetableEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    @ManyToOne(optional = false)
    public Timetable timetable;
    @ManyToOne(optional = false)
    public Division division;
    @ManyToOne(optional = false)
    public Subject subject;
    @ManyToOne(optional = false)
    public Faculty faculty;
    @ManyToOne(optional = false)
    public Room room;
    @ManyToOne(optional = false)
    public TimeSlot timeSlot;
}
