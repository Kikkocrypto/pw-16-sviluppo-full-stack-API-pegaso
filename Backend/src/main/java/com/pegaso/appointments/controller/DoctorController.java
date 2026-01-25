package com.pegaso.appointments.controller;

import com.pegaso.appointments.dto.doctor.CreateDoctorRequest;
import com.pegaso.appointments.dto.doctor.DoctorProfileResponse;
import com.pegaso.appointments.dto.doctor.DoctorResponse;
import com.pegaso.appointments.dto.doctor.UpdateDoctorRequest;
import com.pegaso.appointments.exception.BadRequestException;
import com.pegaso.appointments.exception.ForbiddenException;
import com.pegaso.appointments.repository.AdminRepository;
import com.pegaso.appointments.service.DoctorService;
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

// parte fondamentale per la gestione delle API, si occupa di gestire le richieste in arrivo e restituire le risposte (POST)
@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
@Tag(name = "Doctors", description = "API for managing doctors")
public class DoctorController {

    private static final String HEADER_ADMIN = "X-Demo-Admin-Id";

    private final DoctorService doctorService;
    private final AdminRepository adminRepository;


    
    // Creazione di un nuovo dottore POST api/doctors
    @PostMapping
    @Operation(
            summary = "Crea un nuovo dottore",
            description = "Crea un nuovo dottore con esami associati opzionali. L'email deve essere unica se fornita."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Doctor created successfully",
                    content = @Content(schema = @Schema(implementation = DoctorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad request - validation failed or invalid input"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Not found - one or more exam IDs do not exist"
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Conflict - email already exists or doctor-exam association already exists"
            )
    })
    public ResponseEntity<DoctorResponse> createDoctor(@Valid @RequestBody CreateDoctorRequest request) {
        DoctorResponse response = doctorService.createDoctor(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }




    // Recupero il profilo del dottore GET api/doctors (NON ADMIN)
    @GetMapping
    @Operation(
            summary = "Get doctor profile",
            description = "restituisce il profilo del dottore identificato dall'header X-Demo-Doctor-Id, incluso gli esami abilitati."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Doctor profile",
                    content = @Content(schema = @Schema(implementation = DoctorProfileResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "Bad request - invalid or missing UUID in X-Demo-Doctor-Id"),
            @ApiResponse(responseCode = "404", description = "Doctor not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<DoctorProfileResponse> getDoctorProfile(
            @Parameter(description = "UUID del dottore di cui ottenere il profilo. Obbligatorio per GET /api/doctors.", required = true, example = "660e8400-e29b-41d4-a716-446655440001")
            @RequestHeader(value = "X-Demo-Doctor-Id", required = true) String doctorIdHeader) {
        UUID doctorId;
        try {
            doctorId = UUID.fromString(doctorIdHeader.trim());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid UUID format");
        }
        DoctorProfileResponse response = doctorService.getDoctorProfile(doctorId);
        return ResponseEntity.ok(response);
    }




    // Aggiornamento del profilo del dottore PATCH api/doctors con swagger documentation
    @PatchMapping
    @Operation(
            summary = "Update doctor profile",
            description = "Aggiorna il profilo del dottore identificato dall'header X-Demo-Doctor-Id. Solo i campi presenti nel body verranno aggiornati (aggiornamento parziale)."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Doctor profile updated successfully",
                    content = @Content(schema = @Schema(implementation = DoctorProfileResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "Bad request - invalid or missing UUID in X-Demo-Doctor-Id, invalid gender, or invalid email"),
            @ApiResponse(responseCode = "404", description = "Doctor not found"),
            @ApiResponse(responseCode = "409", description = "Conflict - email already exists"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    // Aggiornamento del profilo del dottore PATCH api/doctors
    public ResponseEntity<DoctorProfileResponse> updateDoctorProfile(
            @Parameter(description = "UUID del dottore di cui aggiornare il profilo. Obbligatorio per PATCH /api/doctors.", required = true, example = "660e8400-e29b-41d4-a716-446655440001")
            @RequestHeader(value = "X-Demo-Doctor-Id", required = true) String doctorIdHeader,
            @Valid @RequestBody UpdateDoctorRequest request) {
        UUID doctorId;
        try {
            doctorId = UUID.fromString(doctorIdHeader.trim());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid UUID format");
        }
        DoctorProfileResponse response = doctorService.updateDoctorProfile(doctorId, request);
        return ResponseEntity.ok(response);
    }



    // Eliminazione del profilo del dottore DELETE api/doctors
    @DeleteMapping
    @Operation(
            summary = "Delete doctor profile",
            description = "Elimina il profilo del dottore identificato dall'header X-Demo-Doctor-Id. Consentito solo se non esistono prenotazioni attive (non cancellate). Gli appuntamenti con status 'cancelled' non bloccano l'eliminazione. Gli esami associati (doctor_exams) vengono rimossi automaticamente."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Profilo cancellato con successo"),
            @ApiResponse(responseCode = "400", description = "Bad request - invalid or missing UUID, or doctor has active appointments (non-cancelled)"),
            @ApiResponse(responseCode = "404", description = "Doctor not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Void> deleteDoctorProfile(
            @Parameter(description = "UUID del dottore da eliminare. Obbligatorio.", required = true, example = "660e8400-e29b-41d4-a716-446655440001")
            @RequestHeader(value = "X-Demo-Doctor-Id", required = true) String doctorIdHeader) {
        UUID doctorId;
        try {
            doctorId = UUID.fromString(doctorIdHeader.trim());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid UUID format");
        }
        doctorService.deleteDoctor(doctorId);
        // Redirect rimosso: ritorna 204 No Content. Per redirect alla home: ResponseEntity.status(HttpStatus.SEE_OTHER).location(URI.create("/")).build();
        return ResponseEntity.noContent().build();
    }




    // Recupero il profilo del dottore GET api/doctors/{doctorId} + swagger documentation per ADMIN
    @GetMapping(value = "/{doctorId}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(
            summary = "Get doctor by ID (Admin)",
            description = "Recupera il profilo di un dottore in base all'ID. Richiede l'header X-Demo-Admin-Id. L'admin può vedere il profilo di qualsiasi dottore."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Doctor profile",
                    content = @Content(schema = @Schema(implementation = DoctorProfileResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "Bad request - invalid UUID format"),
            @ApiResponse(responseCode = "403", description = "Forbidden - admin not authorized"),
            @ApiResponse(responseCode = "404", description = "Doctor not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    // Recupero il profilo del dottore in base all'ID per ADMIN
    public ResponseEntity<DoctorProfileResponse> getDoctorById(
            @Parameter(description = "UUID of the doctor to retrieve", required = true, example = "660e8400-e29b-41d4-a716-446655440001")
            @PathVariable UUID doctorId,
            @Parameter(description = "UUID of the admin. Required for GET /api/doctors/{doctorId}.", required = true, example = "880e8400-e29b-41d4-a716-446655440001")
            @RequestHeader(value = HEADER_ADMIN, required = false) String adminIdHeader) {

        validateAdminHeader(adminIdHeader);
        UUID adminId = parseUuid(adminIdHeader, HEADER_ADMIN);

        if (!adminRepository.existsById(adminId)) {
            throw new ForbiddenException("Accesso non autorizzato");
        }

        DoctorProfileResponse response = doctorService.getDoctorProfile(doctorId);
        return ResponseEntity.ok(response);
    }




    // Eliminazione del profilo del dottore in base all'ID per ADMIN
    @DeleteMapping(value = "/{doctorId}")
    @Operation(
            summary = "Delete doctor by ID (Admin)",
            description = "Deletes a specific doctor by ID. Requires X-Demo-Admin-Id header. Admin can delete any doctor. Allowed only if doctor has no active appointments (non-cancelled). Appointments with status 'cancelled' do not block deletion. Associated exams (doctor_exams) are automatically removed."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Doctor deleted successfully"),
            @ApiResponse(responseCode = "400", description = "Bad request - invalid UUID format, or doctor has active appointments (non-cancelled)"),
            @ApiResponse(responseCode = "403", description = "Forbidden - admin not authorized"),
            @ApiResponse(responseCode = "404", description = "Doctor not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    // Eliminazione del profilo del dottore in base all'ID per ADMIN
    public ResponseEntity<Void> deleteDoctorById(
            @Parameter(description = "UUID of the doctor to delete", required = true, example = "660e8400-e29b-41d4-a716-446655440001")
            @PathVariable UUID doctorId,
            @Parameter(description = "UUID of the admin. Required for DELETE /api/doctors/{doctorId}.", required = true, example = "880e8400-e29b-41d4-a716-446655440001")
            @RequestHeader(value = HEADER_ADMIN, required = false) String adminIdHeader) {

        validateAdminHeader(adminIdHeader);
        UUID adminId = parseUuid(adminIdHeader, HEADER_ADMIN);

        if (!adminRepository.existsById(adminId)) {
            throw new ForbiddenException("Accesso non autorizzato");
        }

        doctorService.deleteDoctor(doctorId);
        return ResponseEntity.noContent().build();
    }

    // Validazione che sia presente l'header ADMIN
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
