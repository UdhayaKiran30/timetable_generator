package com.edumerge.timetable.repository;

import com.edumerge.timetable.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface TimetableRepository extends JpaRepository<Timetable, Long> {

    List<Timetable> findByDepartmentIdAndSemesterAndAcademicYearOrderByVersionDesc(Long d, int s, String y);

    Optional<Timetable> findFirstByDepartmentIdAndSemesterAndAcademicYearAndStatus(Long d, int s, String y, TimetableStatus st);

    List<Timetable> findAllByOrderByCreatedAtDesc();
}
