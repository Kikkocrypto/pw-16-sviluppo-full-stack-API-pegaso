package com.pegaso.appointments.dto.doctor;

import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import com.pegaso.appointments.validation.ValidEmailDomain;
import com.pegaso.appointments.validation.ValidPhoneNumber;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// DTO per l'aggiornamento del profilo del dottore
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request DTO for updating a doctor profile (partial update)")
public class UpdateDoctorRequest {

    @JsonSetter(nulls = Nulls.FAIL)
    @Size(max = 100, message = "First name must not exceed 100 characters")
    @Schema(description = "Doctor's first name", example = "Mario", maxLength = 100)
    private String firstName;

    @JsonSetter(nulls = Nulls.FAIL)
    @Size(max = 100, message = "Last name must not exceed 100 characters")
    @Schema(description = "Doctor's last name", example = "Rossi", maxLength = 100)
    private String lastName;

    @Size(max = 150, message = "Specialization must not exceed 150 characters")
    @Schema(description = "Doctor's specialization", example = "Cardiology", maxLength = 150)
    private String specialization;

    @Pattern(regexp = "^(?i)(M|F|Other)$", message = "Gender must be M, F, or Other")
    @Size(max = 10, message = "Gender must not exceed 10 characters")
    @Schema(description = "Doctor's gender", example = "M", allowableValues = {"M", "F", "Other"}, maxLength = 10)
    private String gender;

    @Email(message = "Email must be valid")
    @ValidEmailDomain(message = "Email must have a valid domain (e.g., .com, .it, .org)")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    @Schema(description = "Doctor's email address (must be unique if provided)", example = "mario.rossi@example.com", maxLength = 255)
    private String email;

    @ValidPhoneNumber(message = "Invalid phone number format")
    @Size(max = 20, message = "Phone number must not exceed 20 characters")
    @Schema(description = "Doctor's phone number", example = "+39 123 456 7890", maxLength = 20)
    private String phoneNumber;
}
