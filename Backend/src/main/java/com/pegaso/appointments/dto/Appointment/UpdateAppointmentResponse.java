package com.pegaso.appointments.dto.appointment;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;


// DTO per la risposta dell'aggiornamento di un appuntamento
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response DTO for updated appointment")
public class UpdateAppointmentResponse {

    @Schema(description = "Unique identifier of the appointment")
    private UUID id;

    @Schema(description = "Scheduled date and time of the appointment")
    private LocalDateTime appointmentDate;

    @Schema(description = "Identifier of the patient")
    private UUID patientId;

    @Schema(description = "Patient email")
    private String patientEmail;

    @Schema(description = "Status of the appointment (pending, confirmed, cancelled)")
    private String status;

    @Schema(description = "Reason for the visit")
    private String reason;

    @Schema(description = "Contraindications for the appointment")
    private String contraindications;

    @Schema(description = "Name of the exam")
    private String examName;
}
