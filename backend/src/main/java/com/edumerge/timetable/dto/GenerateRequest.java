package com.edumerge.timetable.dto;

import jakarta.validation.constraints.*;

public record GenerateRequest(@NotNull Long departmentId, @Min(1) int semester, @NotBlank String academicYear) {
}
