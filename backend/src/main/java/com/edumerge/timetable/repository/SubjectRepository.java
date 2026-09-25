package com.edumerge.timetable.repository;

import com.edumerge.timetable.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
}
