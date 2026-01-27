package com.pegaso.appointments.dto.appointment;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

// DTO per la risposta dell'endpoint GET /api/appointments per dottore, paziente e admin
// In base all'header inserito, verranno mostrati gli appuntamenti relativi
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Appointment list item response")
public class AppointmentResponse {

    @Schema(description = "Unique identifier of the appointment")
    private UUID id;

    @Schema(description = "Scheduled date and time of the appointment")
    private LocalDateTime appointmentDate;

    @Schema(description = "Identifier of the doctor")
    private UUID doctorId;

    @Schema(description = "Doctor first name")
    private String doctorFirstName;

    @Schema(description = "Doctor last name")
    private String doctorLastName;

    @Schema(description = "Doctor gender")
    private String doctorGender;

    @Schema(description = "Identifier of the patient")
    private UUID patientId;

    @Schema(description = "Patient first name")
    private String patientFirstName;

    @Schema(description = "Patient last name")
    private String patientLastName;

    @Schema(description = "Patient email")
    private String patientEmail;

    @Schema(description = "Status of the appointment (pending, confirmed, cancelled)")
    private String status;

    @Schema(description = "Reason for the visit")
    private String reason;

    @Schema(description = "Contraindications for the visit")
    private String contraindications;

    @Schema(description = "Duration of the exam in minutes")
    private Integer durationMinutes;

    @Schema(description = "Name of the exam")
    private String examName;
}
