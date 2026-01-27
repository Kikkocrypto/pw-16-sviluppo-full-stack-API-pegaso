package com.pegaso.appointments.dto.appointment;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// DTO per la richiesta di aggiornamento di un appuntamento
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request DTO for updating an appointment")
public class UpdateAppointmentRequest {

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Scheduled date and time of the appointment (must be in the future)", example = "2026-02-15T10:00:00")
    private LocalDateTime appointmentDate;

    @Schema(description = "Status of the appointment (pending, confirmed, cancelled)", example = "confirmed")
    private String status;

    @Schema(description = "Reason for the visit", example = "Patient requested morning appointment")
    private String reason;

    @Schema(description = "Optional contraindications for the appointment", example = "Patient has allergies to contrast agents")
    private String contraindications;
}
