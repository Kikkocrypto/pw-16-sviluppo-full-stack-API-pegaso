package com.pegaso.appointments.dto.exam;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


// DTO per la creazione di un nuovo esame
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request DTO for creating a new exam")
public class CreateExamRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 150, message = "Name must not exceed 150 characters")
    @Schema(description = "Exam name (unique)", example = "Radiologia Digitale", required = true, maxLength = 150)
    private String name;

    @Schema(description = "Exam description", example = "Esame endoscopico del colon")
    private String description;

    @NotNull(message = "Duration minutes is required")
    @Min(value = 1, message = "Duration minutes must be greater than 0")
    @Schema(description = "Standard duration of the exam in minutes", example = "30", required = true, minimum = "1")
    private Integer durationMinutes;

    @Schema(description = "Whether the exam is active (default: true)", example = "true")
    private Boolean isActive;
}
