package com.edumerge.timetable.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "faculty_subject", uniqueConstraints = @UniqueConstraint(columnNames = { "faculty_id", "subject_id" }))
public class FacultySubject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    @ManyToOne(optional = false)
    public Faculty faculty;
    @ManyToOne(optional = false)
    public Subject subject;
}
