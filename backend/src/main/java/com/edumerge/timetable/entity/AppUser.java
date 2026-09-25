package com.edumerge.timetable.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "app_user", uniqueConstraints = @UniqueConstraint(columnNames = "username"))
public class AppUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    @Column(nullable = false)
    public String username;
    @Column(nullable = false)
    public String passwordHash;
    @Enumerated(EnumType.STRING)
    public Role role;
    @ManyToOne
    public Faculty faculty;
    @ManyToOne
    public Division division;
}
