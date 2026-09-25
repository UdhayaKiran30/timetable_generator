package com.edumerge.timetable.entity;

import jakarta.persistence.*;
import java.time.*;
import java.util.*;

@Entity
@Table(name = "timetable", indexes = @Index(name = "idx_tt_scope", columnList = "academic_year,semester,status"))
public class Timetable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    public String academicYear;
    public int semester;
    public int version;
    @Enumerated(EnumType.STRING)
    public TimetableStatus status;
    public Instant createdAt = Instant.now();
    public Instant publishedAt;
    @ManyToOne
    public Department department;
    @OneToMany(mappedBy = "timetable", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<TimetableEntry> entries = new ArrayList<>();
}
