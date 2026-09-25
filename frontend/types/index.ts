export type Role = 'ADMIN' | 'FACULTY' | 'STUDENT';

export interface Department {
  id: number;
  name: string;
  code: string;
}

export interface Division {
  id: number;
  name: string;
  semester: number;
  studentCount: number;
  department?: Department;
}

export interface Faculty {
  id: number;
  name: string;
  email: string;
  department?: Department;
}

export type SubjectType = 'THEORY' | 'LAB';

export interface Subject {
  id: number;
  name: string;
  code: string;
  weeklyPeriods: number;
  type: SubjectType;
}

export type RoomType = 'CLASSROOM' | 'LAB';

export interface Room {
  id: number;
  name: string;
  capacity: number;
  type: RoomType;
}

export type Day = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY';

export interface TimeSlot {
  id: number;
  day: Day;
  periodNumber: number;
  startTime: string;
  endTime: string;
}

export interface FacultyAvailability {
  id: number;
  faculty: Faculty;
  day: Day;
  periodNumber: number;
  available: boolean;
}

export interface TeachingAssignment {
  id: number;
  division: Division;
  subject: Subject;
  faculty: Faculty;
  requiredPeriods: number;
}

export type TimetableStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface TimetableEntry {
  id: number;
  division: Division;
  subject: Subject;
  faculty: Faculty;
  room: Room;
  timeSlot: TimeSlot;
}

export interface Timetable {
  id: number;
  academicYear: string;
  semester: number;
  version: number;
  status: TimetableStatus;
  createdAt: string;
  publishedAt?: string;
  department: Department;
  entries: TimetableEntry[];
}

export interface ConflictResult {
  type: string;
  severity: string;
  message: string;
  facultyId?: number;
  subjectId?: number;
  divisionId?: number;
}

export interface GenerateResponse {
  success: boolean;
  message?: string;
  timetable?: Timetable;
  hardConstraints?: string;
  conflicts?: ConflictResult[];
}

export interface UserProfile {
  id: number;
  username: string;
  role: Role;
  displayName: string;
  facultyId?: number;
  facultyName?: string;
  divisionId?: number;
  divisionName?: string;
  departmentId?: number;
  departmentName?: string;
}
