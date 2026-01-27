package com.pegaso.appointments.dto.doctor;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

//  DTO per la risposta del dottore
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response DTO containing doctor information")
public class DoctorResponse {

    @Schema(description = "Unique identifier of the doctor", example = "550e8400-e29b-41d4-a716-446655440000")
    private UUID id;

    @Schema(description = "Doctor's first name", example = "Mario")
    private String firstName;

    @Schema(description = "Doctor's last name", example = "Rossi")
    private String lastName;

    @Schema(description = "Doctor's gender", example = "M")
    private String gender;

    @Schema(description = "Doctor's email address", example = "mario.rossi@example.com")
    private String email;

    @Schema(description = "Doctor's phone number", example = "+39 123 456 7890")
    private String phoneNumber;

    @Schema(description = "Timestamp when the doctor was created", example = "2024-01-15T10:30:00Z")
    private OffsetDateTime createdAt;

    @Schema(description = "Timestamp when the doctor was last updated", example = "2024-01-15T10:30:00Z")
    private OffsetDateTime updatedAt;

    @Schema(description = "List of exam IDs associated with the doctor", example = "[\"550e8400-e29b-41d4-a716-446655440000\"]")
    private List<UUID> examIds;
}
