package com.pegaso.appointments.dto.appointment;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

// DTO per la richiesta di creazione di un nuovo appuntamento
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request DTO for creating a new appointment")
public class AppointmentRequest {

    @NotNull(message = "Exam ID is required")
    @Schema(description = "Identifier of the exam", example = "770e8400-e29b-41d4-a716-446655440001", required = true)
    private UUID examId;

    @NotNull(message = "Appointment date is required")
    @Future(message = "Appointment date must be in the future")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Scheduled date and time of the appointment (must be in the future)", example = "2026-02-15T10:00:00", required = true)
    private LocalDateTime appointmentDate;

    @Schema(description = "Optional notes for the appointment", example = "Routine check-up")
    private String notes;

    @Schema(description = "Optional contraindications for the appointment", example = "Patient has allergies to contrast agents")
    private String contraindications;
}
