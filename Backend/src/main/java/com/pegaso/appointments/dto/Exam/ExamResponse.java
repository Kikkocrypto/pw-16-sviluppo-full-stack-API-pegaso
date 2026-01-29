package com.pegaso.appointments.dto.exam;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

// DTO per la risposta dell'esame
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response DTO containing created exam information")
public class ExamResponse {

    @Schema(description = "Unique identifier of the exam", example = "770e8400-e29b-41d4-a716-446655440001")
    private UUID id;

    @Schema(description = "Exam name", example = "Radiologia Digitale")
    private String name;

    @Schema(description = "Exam description", example = "Esame endoscopico del colon")
    private String description;

    @Schema(description = "Standard duration of the exam in minutes", example = "30")
    private Integer durationMinutes;

    @Schema(description = "Whether the exam is active", example = "true")
    private Boolean isActive;

    @Schema(description = "Timestamp when the exam was created", example = "2026-01-21T14:30:00Z")
    private OffsetDateTime createdAt;

    @Schema(description = "Timestamp when the exam was last updated", example = "2026-01-21T14:30:00Z")
    private OffsetDateTime updatedAt;
}
