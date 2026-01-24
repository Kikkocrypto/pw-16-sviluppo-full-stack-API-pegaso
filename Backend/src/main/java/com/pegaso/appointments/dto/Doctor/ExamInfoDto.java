package com.pegaso.appointments.dto.doctor;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;
// DTO per l'info dell'esame all'interno del profilo del dottore
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Exam info within doctor profile")
public class ExamInfoDto {

    @Schema(description = "Exam identifier", example = "550e8400-e29b-41d4-a716-446655440000")
    private UUID examId;  

    @Schema(description = "Exam name", example = "Blood analysis")
    private String examName;

    @Schema(description = "Exam description")
    private String description;
}
