package com.edumerge.timetable.config;

import com.edumerge.timetable.entity.*;
import com.edumerge.timetable.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.time.*;
import java.util.*;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seed(DepartmentRepository dr, DivisionRepository vr, FacultyRepository fr, SubjectRepository sr,
            FacultySubjectRepository fsr, RoomRepository rr, TimeSlotRepository tr, FacultyAvailabilityRepository far,
            TeachingAssignmentRepository tar, AppUserRepository ur, PasswordEncoder pe) {
        return args -> {
            if (dr.count() > 0) {
                return;
            }
            Department cse = new Department();
            cse.name = "Computer Science & Engineering";
            cse.code = "CSE";
            dr.save(cse);
            Department ece = new Department();
            ece.name = "Electronics & Communication";
            ece.code = "ECE";
            dr.save(ece);
            Division a = new Division();
            a.department = cse;
            a.name = "CSE-A";
            a.semester = 6;
            a.studentCount = 55;
            vr.save(a);
            Division b = new Division();
            b.department = cse;
            b.name = "CSE-B";
            b.semester = 6;
            b.studentCount = 50;
            vr.save(b);
            Division c = new Division();
            c.department = ece;
            c.name = "ECE-A";
            c.semester = 6;
            c.studentCount = 48;
            vr.save(c);
            Faculty f1 = faculty(fr, "Prof. Kumar", "kumar@edumerge.local", cse);
            Faculty f2 = faculty(fr, "Prof. Priya", "priya@edumerge.local", cse);
            Faculty f3 = faculty(fr, "Prof. Arun", "arun@edumerge.local", cse);
            Faculty f4 = faculty(fr, "Prof. Meena", "meena@edumerge.local", ece);
            Subject java = sub(sr, "Java Programming", "CS601", 4, SubjectType.THEORY);
            Subject db = sub(sr, "Database Systems", "CS602", 3, SubjectType.THEORY);
            Subject net = sub(sr, "Computer Networks", "CS603", 3, SubjectType.THEORY);
            Subject lab = sub(sr, "DBMS Lab", "CS604L", 2, SubjectType.LAB);
            Subject math = sub(sr, "Engineering Mathematics", "MA601", 3, SubjectType.THEORY);
            link(fsr, f1, java);
            link(fsr, f2, db);
            link(fsr, f3, net);
            link(f2, fsr, lab);
            link(f3, fsr, math);
            room(rr, "Room 101", 70, RoomType.CLASSROOM);
            room(rr, "Room 102", 60, RoomType.CLASSROOM);
            room(rr, "Room 201", 55, RoomType.CLASSROOM);
            room(rr, "DB Lab", 60, RoomType.LAB);
            for (Day d : List.of(Day.MONDAY, Day.TUESDAY, Day.WEDNESDAY, Day.THURSDAY, Day.FRIDAY)) {
                for (int p = 1; p <= 6; p++) {
                    TimeSlot t = new TimeSlot();
                    t.day = d;
                    t.periodNumber = p;
                    t.startTime = LocalTime.of(8 + p, 0);
                    t.endTime = t.startTime.plusHours(1);
                    tr.save(t);
                    for (Faculty f : List.of(f1, f2, f3, f4)) {
                        FacultyAvailability av = new FacultyAvailability();
                        av.faculty = f;
                        av.day = d;
                        av.periodNumber = p;
                        av.available = true;
                        far.save(av);
                    }
                }
            }
            assign(tar, a, java, f1, 4);
            assign(tar, a, db, f2, 3);
            assign(tar, a, net, f3, 3);
            assign(tar, a, lab, f2, 2);
            assign(tar, a, math, f3, 3);
            assign(tar, b, java, f1, 4);
            assign(tar, b, db, f2, 3);
            assign(tar, b, net, f3, 3);
            AppUser admin = new AppUser();
            admin.username = "admin";
            admin.passwordHash = pe.encode("admin123");
            admin.role = com.edumerge.timetable.entity.Role.ADMIN;
            ur.save(admin);
            AppUser faculty = new AppUser();
            faculty.username = "kumar";
            faculty.passwordHash = pe.encode("faculty123");
            faculty.role = com.edumerge.timetable.entity.Role.FACULTY;
            faculty.faculty = f1;
            ur.save(faculty);
            AppUser student = new AppUser();
            student.username = "student";
            student.passwordHash = pe.encode("student123");
            student.role = com.edumerge.timetable.entity.Role.STUDENT;
            student.division = a;
            ur.save(student);
        };
    }

    private Faculty faculty(FacultyRepository r, String n, String e, Department d) {
        Faculty f = new Faculty();
        f.name = n;
        f.email = e;
        f.department = d;
        return r.save(f);
    }

    private Subject sub(SubjectRepository r, String n, String c, int p, SubjectType t) {
        Subject s = new Subject();
        s.name = n;
        s.code = c;
        s.weeklyPeriods = p;
        s.type = t;
        return r.save(s);
    }

    private void link(FacultySubjectRepository r, Faculty f, Subject s) {
        FacultySubject x = new FacultySubject();
        x.faculty = f;
        x.subject = s;
        r.save(x);
    }

    private void link(Faculty f, FacultySubjectRepository r, Subject s) {
        link(r, f, s);
    }

    private void room(RoomRepository r, String n, int cap, RoomType t) {
        Room x = new Room();
        x.name = n;
        x.capacity = cap;
        x.type = t;
        r.save(x);
    }

    private void assign(TeachingAssignmentRepository r, Division d, Subject s, Faculty f, int p) {
        TeachingAssignment x = new TeachingAssignment();
        x.division = d;
        x.subject = s;
        x.faculty = f;
        x.requiredPeriods = p;
        r.save(x);
    }
}
