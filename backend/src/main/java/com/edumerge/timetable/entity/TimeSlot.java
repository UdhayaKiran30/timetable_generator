package com.edumerge.timetable.entity;

import jakarta.persistence.*;
import java.time.*;

@Entity
@Table(name = "time_slot", uniqueConstraints = @UniqueConstraint(columnNames = { "day", "period_number" }))
public class TimeSlot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    @Enumerated(EnumType.STRING)
    public Day day;
    public int periodNumber;
    public LocalTime startTime;
    public LocalTime endTime;
}
