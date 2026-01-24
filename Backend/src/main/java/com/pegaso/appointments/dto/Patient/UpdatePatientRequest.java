package com.pegaso.appointments.dto.patient;

import com.pegaso.appointments.validation.ValidEmailDomain;
import com.pegaso.appointments.validation.ValidGender;
import com.pegaso.appointments.validation.ValidPhoneNumber;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

// DTO per l'aggiornamento del profilo del paziente, utilizzato per l'aggiornamento parziale del profilo del paziente
// Swagger documentation
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request DTO for updating a patient profile (partial update)")
public class UpdatePatientRequest {

    @Size(max = 100, message = "First name must not exceed 100 characters")
    @Schema(description = "Patient's first name", example = "Mario", maxLength = 100)
    private String firstName;

    @Size(max = 100, message = "Last name must not exceed 100 characters")
    @Schema(description = "Patient's last name", example = "Rossi", maxLength = 100)
    private String lastName;

    @ValidGender
    @Size(max = 10, message = "Gender must not exceed 10 characters")
    @Schema(description = "Patient's gender", example = "M", allowableValues = {"M", "F", "Other"}, maxLength = 10)
    private String gender;

    @Email(message = "Email must be valid")
    @ValidEmailDomain(message = "Email must have a valid domain (e.g., .com, .it, .org)")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    @Schema(description = "Patient's email (unique if provided)", example = "mario.rossi@example.com", maxLength = 255)
    private String email;

    @ValidPhoneNumber(message = "Invalid phone number format")
    @Size(max = 20, message = "Phone number must not exceed 20 characters")
    @Schema(description = "Patient's phone number", example = "+39 123 456 7890", maxLength = 20)
    private String phoneNumber;

    @Schema(description = "Patient's date of birth (YYYY-MM-DD)", example = "1990-05-15")
    private LocalDate dateOfBirth;
}
