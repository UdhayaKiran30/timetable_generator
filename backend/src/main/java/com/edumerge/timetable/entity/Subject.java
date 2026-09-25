package com.edumerge.timetable.entity;

import jakarta.persistence.*;
import java.time.*;

@Entity
@Table(name = "subject", indexes = @Index(name = "idx_subject_code", columnList = "code"))
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    @Column(nullable = false)
    public String name;
    @Column(nullable = false, unique = true)
    public String code;
    public int weeklyPeriods;
    @Enumerated(EnumType.STRING)
    public SubjectType type;
    public Instant createdAt = Instant.now();
    public Instant updatedAt = Instant.now();
}
