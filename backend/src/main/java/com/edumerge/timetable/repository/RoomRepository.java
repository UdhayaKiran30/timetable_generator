package com.edumerge.timetable.repository;

import com.edumerge.timetable.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface RoomRepository extends JpaRepository<Room, Long> {
}
