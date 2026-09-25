package com.edumerge.timetable.entity;

import jakarta.persistence.*;
import java.time.*;

@Entity
@Table(name = "room", indexes = @Index(name = "idx_room_type_capacity", columnList = "type,capacity"))
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    @Column(nullable = false, unique = true)
    public String name;
    public int capacity;
    @Enumerated(EnumType.STRING)
    public RoomType type;
    public Instant createdAt = Instant.now();
    public Instant updatedAt = Instant.now();
}
