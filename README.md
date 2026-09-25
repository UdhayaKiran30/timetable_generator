# EduMerge Solutions — Intelligent Timetable Generator

Production-oriented MVP for the Pre-Drive Product Engineering Assignment 3. It uses a deterministic constraint-satisfaction/backtracking scheduler; no LLM is used for timetable generation.

## Stack
- Frontend: Next.js + TypeScript + Tailwind CSS
- Backend: Java 17 + Spring Boot + Spring Data JPA + Spring Security/JWT
- Database: PostgreSQL
- Deployment: Docker Compose

## Architecture
```text
Next.js → REST API → Spring Boot Controllers → Services → Scheduling Engine → Independent Validator → PostgreSQL
```

## Features
- JWT login with ADMIN/FACULTY/STUDENT roles
- Master-data endpoints for departments, divisions, faculty, subjects, rooms, slots, availability and teaching assignments
- Deterministic backtracking scheduling
- Hard constraints: division, faculty, room, capacity, room type, availability, weekly periods and faculty-subject qualification
- Independent post-generation validation
- Structured conflict responses
- Draft/version/publish workflow
- Responsive timetable viewer
- Seed data and Docker PostgreSQL

## Demo credentials
- Admin: `admin` / `admin123`
- Faculty: `kumar` / `faculty123`
- Student: `student` / `student123`

Change these credentials before production use.

## Run with Docker
1. Copy `.env.example` to `.env` and replace secrets.
2. Run `docker compose up --build`.
3. Open `http://localhost:3000`.
4. Backend API: `http://localhost:8080/api`.

If Docker is unavailable, start PostgreSQL separately, run the backend with Maven, then run the frontend with `npm install && npm run dev`.

## Generation workflow
Admin selects department, semester and academic year. The backend loads assignments, rooms, slots and availability, orders difficult assignments first, searches valid placements with backtracking, then runs the independent validator. Only a validated timetable is saved as `DRAFT`.

## Conflict behavior
Generation failure returns structured conflicts rather than a generic error, for example `FACULTY_AVAILABILITY`, `NO_COMPATIBLE_SLOT`, `ROOM_CAPACITY`, or `NO_ASSIGNMENTS`.

## Testing
Backend unit/integration tests should cover the solver, validator, conflict analysis, generation endpoint and publishing. The scheduling engine is intentionally isolated from Spring MVC and persistence so it can be tested as a pure Java component.

## Known limitations
- Soft constraints are reserved for the next iteration; hard correctness is prioritized.
- CRUD screens are intentionally lightweight for the MVP.
- Faculty/student timetable filtering endpoints can be added as thin query services around `TimetableEntry`.
- The current seed demonstrates a valid CSE semester; an impossible fixture should be inserted in a test profile for failure demos.

## Future improvements
Advanced CSP/ILP solver, weighted soft-constraint optimization, drag-and-drop editing, PDF/Excel export, notifications, audit logs and analytics.
