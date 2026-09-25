package com.edumerge.timetable.entity;

import jakarta.persistence.*;
import java.time.*;

@Entity
@Table(name = "division", indexes = @Index(name = "idx_division_dept", columnList = "department_id"))
public class Division {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    @ManyToOne(optional = false)
    public Department department;
    @Column(nullable = false)
    public String name;
    public int semester;
    public int studentCount;
    public Instant createdAt = Instant.now();
    public Instant updatedAt = Instant.now();
}
