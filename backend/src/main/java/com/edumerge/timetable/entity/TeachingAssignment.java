package com.edumerge.timetable.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "teaching_assignment", indexes = @Index(name = "idx_assignment_division", columnList = "division_id"))
public class TeachingAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    @ManyToOne(optional = false)
    public Division division;
    @ManyToOne(optional = false)
    public Subject subject;
    @ManyToOne(optional = false)
    public Faculty faculty;
    public int requiredPeriods;
}
