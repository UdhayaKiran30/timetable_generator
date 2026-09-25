package com.edumerge.timetable.repository;

import com.edumerge.timetable.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface FacultySubjectRepository extends JpaRepository<FacultySubject, Long> {

    boolean existsByFacultyIdAndSubjectId(Long f, Long s);

    List<FacultySubject> findByFacultyId(Long id);
}
