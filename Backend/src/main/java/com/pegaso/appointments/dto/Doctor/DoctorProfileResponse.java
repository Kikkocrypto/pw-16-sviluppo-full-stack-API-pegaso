package com.pegaso.appointments.dto.doctor;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

// DTO per il profilo del dottore con gli esami abilitati
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Full doctor profile with enabled exams")
public class DoctorProfileResponse {

    @Schema(description = "Doctor identifier", example = "550e8400-e29b-41d4-a716-446655440000")
    private UUID id;

    @Schema(description = "First name", example = "Mario")
    private String firstName;

    @Schema(description = "Last name", example = "Rossi")
    private String lastName;

    @Schema(description = "Specialization", example = "Cardiology")
    private String specialization;

    @Schema(description = "Gender", example = "M")
    private String gender;

    @Schema(description = "Email", example = "mario.rossi@example.com")
    private String email;

    @Schema(description = "Phone number", example = "+391234567890")
    private String phoneNumber;

    @Schema(description = "Exams the doctor is enabled for")
    private List<ExamInfoDto> exams;
}
