package com.pegaso.appointments.dto.appointment;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

// DTO per la risposta della creazione di un nuovo appuntamento
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response DTO for created appointment")
public class AppointmentCreateResponse {

    @Schema(description = "Unique identifier of the appointment")
    private UUID id;

    @Schema(description = "Scheduled date and time of the appointment")
    private LocalDateTime appointmentDate;

    @Schema(description = "Identifier of the doctor")
    private UUID doctorId;

    @Schema(description = "Identifier of the patient")
    private UUID patientId;

    @Schema(description = "Status of the appointment")
    private String status;

    @Schema(description = "Name of the exam")
    private String examName;
}
