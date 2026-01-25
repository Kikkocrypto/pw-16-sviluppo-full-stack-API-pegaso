package com.pegaso.appointments.controller;

import com.pegaso.appointments.dto.patient.CreatePatientRequest;
import com.pegaso.appointments.dto.patient.PatientResponse;
import com.pegaso.appointments.dto.patient.UpdatePatientRequest;
import com.pegaso.appointments.exception.BadRequestException;
import com.pegaso.appointments.exception.ForbiddenException;
import com.pegaso.appointments.repository.AdminRepository;
import com.pegaso.appointments.service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

// controller per la gestione dei pazienti
// POST api/patients
@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
@Tag(name = "Patients", description = "API for managing patients")
public class PatientController {

    private static final String HEADER_ADMIN = "X-Demo-Admin-Id";

    private final PatientService patientService;
    private final AdminRepository adminRepository;

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(
            summary = "Crea un nuovo paziente",
            description = "Crea un nuovo paziente. Email deve essere unica se fornita. firstName e lastName sono obbligatori."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Patient created successfully",
                    content = @Content(schema = @Schema(implementation = PatientResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad request - validation failed (required fields, invalid email, invalid gender, invalid date format)"
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Conflict - email already exists"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal server error - unexpected persistence error"
            )
    })
    public ResponseEntity<PatientResponse> createPatient(@Valid @RequestBody CreatePatientRequest request) {
        PatientResponse response = patientService.createPatient(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Recupero il profilo del paziente GET api/patients + swagger documentation
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(
            summary = "Recupera il profilo del paziente",
            description = "Recupera il profilo del paziente identificato dall'header X-Demo-Patient-Id."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Patient profile",
                    content = @Content(schema = @Schema(implementation = PatientResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "Bad request - invalid or missing UUID in X-Demo-Patient-Id"),
            @ApiResponse(responseCode = "404", description = "Patient not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<PatientResponse> getPatientProfile(
            @Parameter(description = "UUID of the patient. Required for GET /api/patients.", required = true, example = "550e8400-e29b-41d4-a716-446655440000")
            @RequestHeader(value = "X-Demo-Patient-Id", required = true) String patientIdHeader) {
        UUID patientId;
        try {
            patientId = UUID.fromString(patientIdHeader.trim());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid UUID format");
        }
        PatientResponse response = patientService.getPatientProfile(patientId);
        return ResponseEntity.ok(response);
    }


    // Aggiornamento del profilo del paziente PATCH api/patients + swagger documentation
    @PatchMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(
            summary = "Aggiorna il profilo del paziente",
            description = "Aggiorna il profilo del paziente identificato dall'header X-Demo-Patient-Id. Solo i campi presenti nel body sono aggiornati (aggiornamento parziale)."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Patient profile updated successfully",
                    content = @Content(schema = @Schema(implementation = PatientResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "Bad request - invalid or missing UUID, invalid gender, invalid email, invalid dateOfBirth"),
            @ApiResponse(responseCode = "404", description = "Patient not found"),
            @ApiResponse(responseCode = "409", description = "Conflict - email already exists"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<PatientResponse> updatePatientProfile(
            @Parameter(description = "UUID of the patient. Required for PATCH /api/patients.", required = true, example = "550e8400-e29b-41d4-a716-446655440000")
            @RequestHeader(value = "X-Demo-Patient-Id", required = true) String patientIdHeader,
            @Valid @RequestBody UpdatePatientRequest request) {
        UUID patientId;
        try {
            patientId = UUID.fromString(patientIdHeader.trim());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid UUID format");
        }
        PatientResponse response = patientService.updatePatientProfile(patientId, request);
        return ResponseEntity.ok(response);
    }




    // Eliminazione del profilo del paziente DELETE api/patients + swagger documentation
    @DeleteMapping
    @Operation(
            summary = "Elimina il profilo del paziente",
            description = "Elimina il profilo del paziente identificato dall'header X-Demo-Patient-Id. Consentito solo se non esistono prenotazioni attive (non cancellate). Gli appuntamenti con status 'cancelled' non bloccano l'eliminazione."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Profilo cancellato con successo"),
            @ApiResponse(responseCode = "400", description = "Bad request - invalid or missing UUID, or patient has active appointments (non-cancelled)"),
            @ApiResponse(responseCode = "404", description = "Patient not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Void> deletePatientProfile(
            @Parameter(description = "UUID del paziente da eliminare. Obbligatorio.", required = true, example = "550e8400-e29b-41d4-a716-446655440000")
            @RequestHeader(value = "X-Demo-Patient-Id", required = true) String patientIdHeader) {
        UUID patientId;
        try {
            patientId = UUID.fromString(patientIdHeader.trim());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid UUID format");
        }
        patientService.deletePatient(patientId);
        return ResponseEntity.noContent().build();
    }



// Recupero il profilo del paziente GET api/patients/{patientId} + swagger documentation per ADMIN
    @GetMapping(value = "/{patientId}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(
            summary = "Recupera un paziente by ID (Admin o Patient)",
            description = "Recupera il profilo di un paziente in base all'ID. Richiede l'header X-Demo-Admin-Id. L'admin può vedere il profilo di qualsiasi paziente."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Patient profile",
                    content = @Content(schema = @Schema(implementation = PatientResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "Bad request - invalid UUID format"),
            @ApiResponse(responseCode = "403", description = "Forbidden - admin not authorized"),
            @ApiResponse(responseCode = "404", description = "Patient not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    // Recupero il profilo del paziente in base all'ID per ADMIN
    public ResponseEntity<PatientResponse> getPatientById(
            @Parameter(description = "UUID of the patient to retrieve", required = true, example = "550e8400-e29b-41d4-a716-446655440000")
            @PathVariable UUID patientId,
            @Parameter(description = "UUID of the admin. Required for GET /api/patients/{patientId}.", required = true, example = "880e8400-e29b-41d4-a716-446655440001")
            @RequestHeader(value = HEADER_ADMIN, required = false) String adminIdHeader) {

        validateAdminHeader(adminIdHeader);
        UUID adminId = parseUuid(adminIdHeader, HEADER_ADMIN);

        if (!adminRepository.existsById(adminId)) {
            throw new ForbiddenException("Accesso non autorizzato");
        }

        PatientResponse response = patientService.getPatientProfile(patientId);
        return ResponseEntity.ok(response);
    }



    // Eliminazione del profilo del paziente in base all'ID per ADMIN
    @DeleteMapping(value = "/{patientId}")
    @Operation(
            summary = "Elimina un paziente by ID (Admin o Patient)",
            description = "Elimina un paziente in base all'ID. Richiede l'header X-Demo-Admin-Id. Admin può eliminare qualsiasi paziente. Consentito solo se il paziente non ha appuntamenti attivi (non cancellati). Gli appuntamenti con status 'cancelled' non bloccano l'eliminazione."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Patient deleted successfully"),
            @ApiResponse(responseCode = "400", description = "Bad request - invalid UUID format, or patient has active appointments (non-cancelled)"),
            @ApiResponse(responseCode = "403", description = "Forbidden - admin not authorized"),
            @ApiResponse(responseCode = "404", description = "Patient not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    // Eliminazione del profilo del paziente in base all'ID per ADMIN
    public ResponseEntity<Void> deletePatientById(
            @Parameter(description = "UUID of the patient to delete", required = true, example = "550e8400-e29b-41d4-a716-446655440000")
            @PathVariable UUID patientId,
            @Parameter(description = "UUID of the admin. Required for DELETE /api/patients/{patientId}.", required = true, example = "880e8400-e29b-41d4-a716-446655440001")
            @RequestHeader(value = HEADER_ADMIN, required = false) String adminIdHeader) {

        validateAdminHeader(adminIdHeader);
        UUID adminId = parseUuid(adminIdHeader, HEADER_ADMIN);

        if (!adminRepository.existsById(adminId)) {
            throw new ForbiddenException("Accesso non autorizzato");
        }

        patientService.deletePatient(patientId);
        return ResponseEntity.noContent().build();
    }

    private void validateAdminHeader(String adminIdHeader) {
        if (adminIdHeader == null || adminIdHeader.isBlank()) {
            throw new BadRequestException("X-Demo-Admin-Id header is required");
        }
    }

    // Parsing dell'UUID dall'header
    private UUID parseUuid(String value, String headerName) {
        try {
            return UUID.fromString(value.trim());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid header: " + headerName);
        }
    }
}
