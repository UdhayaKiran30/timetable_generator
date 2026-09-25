# Project Documentation

## 1. Project Overview
EduMerge Intelligent Timetable Generator automates college scheduling across divisions, faculty, rooms and time slots while treating hard constraints as non-negotiable.

## 2. Business Requirements
The MVP supports administration of scheduling inputs, deterministic generation, independent validation, conflict explanation and versioned publication.

## 3. User Roles
**ADMIN** manages configuration and publication. **FACULTY** views their schedule. **STUDENT** views their division schedule.

## 4. Functional Modules
Authentication; dashboard; department/division/faculty/subject/room/slot management; availability; teaching assignments; generation; validation; conflict analysis; viewer; versioning/publishing.

## 5. System Architecture
```text
Next.js UI
   ↓ REST/JSON
Spring Boot Controllers
   ↓
Services
   ↓
Scheduling Engine (BacktrackingSolver)
   ↓
Independent TimetableValidator
   ↓
Spring Data JPA
   ↓
PostgreSQL
```

Controllers stay thin. Scheduling logic has no dependency on HTTP and can be tested independently.

## 6. Database Schema
Tables include `department`, `division`, `faculty`, `subject`, `faculty_subject`, `room`, `time_slot`, `faculty_availability`, `teaching_assignment`, `timetable`, `timetable_entry`, and `app_user`. Foreign keys are represented by JPA relationships; uniqueness/indexes protect common integrity and lookup paths.

## 7. Scheduling Algorithm
Each required weekly period is represented as a scheduling task. Tasks are ordered using a difficulty heuristic that prioritizes labs and constrained rooms. For each task, the solver tries time-slot/room combinations. A placement is accepted only if division, faculty, room, capacity, room type, availability and faculty-subject constraints pass. If a later task becomes impossible, the previous placement is undone and another candidate is tried.

This is a standard CSP-style backtracking approach. It is deterministic because the candidate lists are traversed in stable database order and no random choice is introduced.

## 8. Hard Constraints
1. One subject per division per slot.
2. One division per faculty member per slot.
3. One class per room per slot.
4. Room capacity >= division strength.
5. LAB subjects require LAB rooms.
6. Faculty cannot teach when unavailable.
7. Each assignment receives exactly its required weekly periods.
8. Faculty must be associated with the subject.

## 9. Soft Constraints
The architecture leaves room for a scoring layer. The MVP deliberately prioritizes hard correctness before adding preferences such as spreading subjects, reducing idle time and grouping labs.

## 10. Conflict Detection
When no solution exists, the generator returns structured `ConflictResult` objects with type, severity, message and related entity IDs. The UI displays these messages so an administrator can identify corrective actions instead of seeing only “generation failed”.

## 11. API Documentation
- `POST /api/auth/login`
- `GET/POST /api/departments`
- `GET/POST /api/divisions`
- `GET/POST /api/faculty`
- `GET/POST /api/subjects`
- `GET/POST /api/rooms`
- `GET/POST /api/time-slots`
- `GET/POST /api/faculty-availability`
- `GET/POST /api/teaching-assignments`
- `POST /api/timetables/generate`
- `GET /api/timetables/{id}`
- `POST /api/timetables/{id}/validate`
- `POST /api/timetables/{id}/publish`
- `GET /api/timetables?departmentId=&semester=&academicYear=`

Generation request:
```json
{"departmentId":1,"semester":6,"academicYear":"2026-2027"}
```

Failure response shape:
```json
{"success":false,"message":"Unable to generate timetable","conflicts":[{"type":"FACULTY_AVAILABILITY","severity":"HIGH","message":"...","relatedFacultyId":1,"relatedSubjectId":2,"relatedDivisionId":1}]}
```

## 12. Security
Passwords are BCrypt-hashed. JWTs carry role claims. Admin generation and publishing endpoints use method-level role authorization. Database credentials and JWT secrets are environment variables. CORS is restricted to the frontend origin in the MVP.

## 13. Testing
Recommended test matrix: valid schedule; division/faculty/room collision; capacity; lab-room mismatch; unavailable faculty; insufficient weekly slots; invalid faculty-subject mapping; impossible schedule; API generation; validation; publishing.

## 14. Edge Cases
No assignments; no rooms of the required type; room capacity shortage; faculty unavailable for all candidate slots; fewer compatible slots than required periods; conflicting assignments; publishing a draft while another version is published.

## 15. Engineering Decisions
**Next.js** provides a modern component model and responsive UI. **Spring Boot** provides a conventional layered REST backend. **PostgreSQL** gives strong relational integrity. **Backtracking/CSP** is transparent and interview-friendly for this scale. **No LLM** is used because scheduling correctness must be deterministic and independently testable. **Independent validation** prevents hidden generator bugs from becoming published schedules. **Versioning** preserves published history.

## 16. Trade-offs
Backtracking can grow exponentially for highly constrained large datasets. Heuristics reduce the search space but do not provide the global optimization capabilities of an industrial solver. The MVP therefore favors explainability and a clear upgrade path.

## 17. Future Improvements
Use a mature CSP/CP-SAT solver, weighted soft constraints, richer conflict diagnosis, drag/drop editing with revalidation, PDF/Excel export, notifications, audit trails and analytics.
