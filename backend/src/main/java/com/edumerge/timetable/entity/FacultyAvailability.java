package com.edumerge.timetable.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "faculty_availability", uniqueConstraints = @UniqueConstraint(columnNames = { "faculty_id", "day",
        "period_number" }))
public class FacultyAvailability {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    @ManyToOne(optional = false)
    public Faculty faculty;
    @Enumerated(EnumType.STRING)
    public Day day;
    public int periodNumber;
    public boolean available;
}
