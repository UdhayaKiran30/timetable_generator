package com.edumerge.timetable.entity;

import jakarta.persistence.*;
import java.time.*;

@Entity
@Table(name = "department", indexes = @Index(name = "idx_department_code", columnList = "code"))
public class Department {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    @Column(nullable = false)
    public String name;
    @Column(nullable = false, unique = true)
    public String code;
    public Instant createdAt = Instant.now();
    public Instant updatedAt = Instant.now();
}
