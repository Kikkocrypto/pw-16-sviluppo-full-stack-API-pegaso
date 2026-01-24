package com.pegaso.appointments.dto.exam;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// DTO per l'aggiornamento di un esame, utilizzato per l'aggiornamento parziale di un esame
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request DTO for updating an exam (partial update). Name cannot be modified.")
@JsonInclude(JsonInclude.Include.ALWAYS)
public class UpdateExamRequest {

    @Schema(description = "Exam description", example = "Esame endoscopico del colon")
    @JsonInclude(JsonInclude.Include.ALWAYS)
    private String description;

    @Min(value = 1, message = "Duration minutes must be greater than 0")
    @Schema(description = "Standard duration of the exam in minutes", example = "30", minimum = "1")
    private Integer durationMinutes;

    @Schema(description = "Whether the exam is active", example = "true")
    private Boolean isActive;
}
