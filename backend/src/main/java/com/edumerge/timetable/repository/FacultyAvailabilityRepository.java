package com.edumerge.timetable.repository;

import com.edumerge.timetable.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface FacultyAvailabilityRepository extends JpaRepository<FacultyAvailability, Long> {

    List<FacultyAvailability> findByFacultyId(Long id);

    Optional<FacultyAvailability> findByFacultyIdAndDayAndPeriodNumber(Long f, Day d, int p);
}
