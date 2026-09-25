package com.edumerge.timetable.entity;

import jakarta.persistence.*;
import java.time.*;

@Entity
@Table(name = "faculty", indexes = @Index(name = "idx_faculty_dept", columnList = "department_id"))
public class Faculty {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    @Column(nullable = false)
    public String name;
    @Column(nullable = false, unique = true)
    public String email;
    @ManyToOne(optional = false)
    public Department department;
    public Instant createdAt = Instant.now();
    public Instant updatedAt = Instant.now();
}
