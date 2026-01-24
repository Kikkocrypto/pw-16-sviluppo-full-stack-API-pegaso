package com.pegaso.appointments.dto.patient;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

// DTO per la risposta del paziente + lombok
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response DTO containing created patient information")
public class PatientResponse {

    @Schema(description = "Unique identifier of the patient", example = "550e8400-e29b-41d4-a716-446655440000")
    private UUID id;

    @Schema(description = "Patient's first name", example = "Mario")
    private String firstName;

    @Schema(description = "Patient's last name", example = "Rossi")
    private String lastName;

    @Schema(description = "Patient's gender", example = "M")
    private String gender;

    @Schema(description = "Patient's email address", example = "mario.rossi@example.com")
    private String email;

    @Schema(description = "Patient's phone number", example = "+39 123 456 7890")
    private String phoneNumber;

    @Schema(description = "Patient's date of birth", example = "1990-05-15")
    private LocalDate dateOfBirth;

    @Schema(description = "Timestamp when the patient was created", example = "2024-01-15T10:30:00Z")
    private OffsetDateTime createdAt;
}
