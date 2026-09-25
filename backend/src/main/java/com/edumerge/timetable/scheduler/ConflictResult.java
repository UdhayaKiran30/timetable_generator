package com.edumerge.timetable.scheduler;

public record ConflictResult(String type, String severity, String message, Long relatedFacultyId, Long relatedSubjectId, Long relatedDivisionId) {

}
