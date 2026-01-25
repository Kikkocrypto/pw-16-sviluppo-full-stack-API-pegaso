package com.pegaso.appointments.controller;

import com.pegaso.appointments.dto.appointment.AppointmentCreateResponse;
import com.pegaso.appointments.dto.appointment.AppointmentRequest;
import com.pegaso.appointments.dto.appointment.AppointmentResponse;
import com.pegaso.appointments.dto.appointment.UpdateAppointmentRequest;
import com.pegaso.appointments.dto.appointment.UpdateAppointmentResponse;
import com.pegaso.appointments.exception.BadRequestException;
import com.pegaso.appointments.exception.ForbiddenException;
import com.pegaso.appointments.service.AppointmentService;
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

import java.util.List;
import java.util.UUID;

// Controller per la gestione degli appuntamenti (3 possibili header: admin, doctor, patient), in base all'header inserito, verranno mostrati gli appuntamenti relativi
@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@Tag(name = "Appointments", description = "API for listing appointments")
public class AppointmentController {

    private static final String HEADER_ADMIN = "X-Demo-Admin-Id";
    private static final String HEADER_DOCTOR = "X-Demo-Doctor-Id";
    private static final String HEADER_PATIENT = "X-Demo-Patient-Id";

    private final AppointmentService appointmentService;

    // Recupero degli appuntamenti GET api/appointments + swagger documentation
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(
            summary = "Lista appuntamenti",
            description = "Recupera la lista di tutti gli appuntamenti. Richiede esattamente uno dei seguenti header: X-Demo-Admin-Id, X-Demo-Doctor-Id, o X-Demo-Patient-Id. Admin: tutti gli appuntamenti. Dottore/Paziente: filtrati in base all'ID rispettivo."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "List of appointments",
                    content = @Content(schema = @Schema(implementation = AppointmentResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "Bad request - no header, multiple headers, or invalid header"),
            @ApiResponse(responseCode = "403", description = "Forbidden - access not authorized"),
            @ApiResponse(responseCode = "500", description = "Internal server error - unexpected persistence error")
    })
    public ResponseEntity<List<AppointmentResponse>> getAppointments(
            @Parameter(description = "Admin UUID; when present, returns all appointments")
            @RequestHeader(value = HEADER_ADMIN, required = false) String adminIdHeader,
            @Parameter(description = "Doctor UUID; when present, returns appointments for this doctor")
            @RequestHeader(value = HEADER_DOCTOR, required = false) String doctorIdHeader,
            @Parameter(description = "Patient UUID; when present, returns appointments for this patient")
            @RequestHeader(value = HEADER_PATIENT, required = false) String patientIdHeader) {

        validateExactlyOneHeader(adminIdHeader, doctorIdHeader, patientIdHeader);
        // Se l'adminIdHeader è presente, recupero gli appuntamenti come admin
        if (isPresent(adminIdHeader)) {
            UUID adminId = parseUuid(adminIdHeader, HEADER_ADMIN);
            return ResponseEntity.ok(appointmentService.getAppointmentsAsAdmin(adminId));
        }
        if (isPresent(doctorIdHeader)) {
            UUID doctorId = parseUuid(doctorIdHeader, HEADER_DOCTOR);
            return ResponseEntity.ok(appointmentService.getAppointmentsAsDoctor(doctorId));
        }
        UUID patientId = parseUuid(patientIdHeader, HEADER_PATIENT);
        return ResponseEntity.ok(appointmentService.getAppointmentsAsPatient(patientId));
    }




    // Creazione di un nuovo appuntamento POST api/appointments + swagger documentation

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(
            summary = "Crea un nuovo appuntamento",
            description = "Crea un nuovo appuntamento. Richiede l'header X-Demo-Patient-Id. Admin e Dottore non sono consentiti."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Appointment created successfully",
                    content = @Content(schema = @Schema(implementation = AppointmentCreateResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "Bad request - missing or invalid header, invalid request body, or appointment date not in the future"),
            @ApiResponse(responseCode = "403", description = "Forbidden - admin or doctor headers present"),
            @ApiResponse(responseCode = "409", description = "Conflict - time slot not available or business constraints violated"),
            @ApiResponse(responseCode = "500", description = "Internal server error - unexpected persistence error")
    })
    public ResponseEntity<AppointmentCreateResponse> createAppointment(
            @Parameter(description = "Patient UUID (required)")
            @RequestHeader(value = HEADER_PATIENT, required = false) String patientIdHeader,
            @Parameter(description = "Admin UUID (not allowed)")
            @RequestHeader(value = HEADER_ADMIN, required = false) String adminIdHeader,
            @Parameter(description = "Doctor UUID (not allowed)")
            @RequestHeader(value = HEADER_DOCTOR, required = false) String doctorIdHeader,
            @Valid @RequestBody AppointmentRequest request) {

        validatePatientOnlyHeaders(patientIdHeader, adminIdHeader, doctorIdHeader);
        UUID patientId = parseUuid(patientIdHeader, HEADER_PATIENT);

        AppointmentCreateResponse response = appointmentService.createAppointment(patientId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }





    // Recupero di un singolo appuntamento GET api/appointments/{appointmentId} + swagger docu
    @GetMapping(value = "/{appointmentId}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(
            summary = "Recupera un appuntamento by ID",
            description = "Recupera un appuntamento in base all'ID. Richiede esattamente uno dei seguenti header: X-Demo-Admin-Id, X-Demo-Doctor-Id, o X-Demo-Patient-Id. Admin può vedere qualsiasi appuntamento. Dottore/Paziente può vedere solo i loro appuntamenti."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Appointment retrieved successfully",
                    content = @Content(schema = @Schema(implementation = AppointmentResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "Bad request - no header, multiple headers, or invalid header"),
            @ApiResponse(responseCode = "403", description = "Forbidden - access not authorized or unauthorized to view this appointment"),
            @ApiResponse(responseCode = "404", description = "Appointment not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error - unexpected persistence error")
    })
    public ResponseEntity<AppointmentResponse> getAppointmentById(
            @Parameter(description = "UUID of the appointment to retrieve", required = true, example = "990e8400-e29b-41d4-a716-446655440001")
            @PathVariable UUID appointmentId,
            @Parameter(description = "Admin UUID (optional, mutually exclusive with other headers)")
            @RequestHeader(value = HEADER_ADMIN, required = false) String adminIdHeader,
            @Parameter(description = "Doctor UUID (optional, mutually exclusive with other headers)")
            @RequestHeader(value = HEADER_DOCTOR, required = false) String doctorIdHeader,
            @Parameter(description = "Patient UUID (optional, mutually exclusive with other headers)")
            @RequestHeader(value = HEADER_PATIENT, required = false) String patientIdHeader) {

        validateExactlyOneHeader(adminIdHeader, doctorIdHeader, patientIdHeader);

        UUID adminId = null;
        UUID doctorId = null;
        UUID patientId = null;

        if (isPresent(adminIdHeader)) {
            adminId = parseUuid(adminIdHeader, HEADER_ADMIN);
        } else if (isPresent(doctorIdHeader)) {
            doctorId = parseUuid(doctorIdHeader, HEADER_DOCTOR);
        } else {
            patientId = parseUuid(patientIdHeader, HEADER_PATIENT);
        }
        // Recupero dell'appuntamento in base all'ID + verifica che sia presente l'header ADMIN, DOCTOR o PATIENT
        AppointmentResponse response = appointmentService.getAppointmentById(appointmentId, adminId, doctorId, patientId);
        return ResponseEntity.ok(response);
    }



    // Aggiornamento di un appuntamento PATCH api/appointments/{id} + swagger documentation
    @PatchMapping(value = "/{appointmentId}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(
            summary = "Aggiorna un appuntamento",
            description = "Aggiorna un appuntamento. Richiede esattamente uno dei seguenti header: X-Demo-Admin-Id, X-Demo-Patient-Id o X-Demo-Doctor-Id. Admin può modificare tutto (data, stato, note, controindicazioni). Paziente può modificare solo note e controindicazioni. Dottore può modificare solo stato. Solo l'admin può modificare la data dell'appuntamento."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Appointment updated successfully",
                    content = @Content(schema = @Schema(implementation = UpdateAppointmentResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "Bad request - missing or multiple headers, invalid request body, or appointment date not in the future"),
            @ApiResponse(responseCode = "403", description = "Forbidden - unauthorized modification attempt"),
            @ApiResponse(responseCode = "404", description = "Appointment not found"),
            @ApiResponse(responseCode = "409", description = "Conflict - business rules violation, time slot not available, or unauthorized field modification"),
            @ApiResponse(responseCode = "500", description = "Internal server error - unexpected persistence error")
    })
    // Aggiornamento di un appuntamento 
    public ResponseEntity<UpdateAppointmentResponse> updateAppointment(
            @Parameter(description = "UUID of the appointment to update", required = true, example = "990e8400-e29b-41d4-a716-446655440001")
            @PathVariable UUID appointmentId,
            @Parameter(description = "Admin UUID (optional, mutually exclusive with other headers)")
            @RequestHeader(value = HEADER_ADMIN, required = false) String adminIdHeader,
            @Parameter(description = "Patient UUID (optional, mutually exclusive with other headers)")
            @RequestHeader(value = HEADER_PATIENT, required = false) String patientIdHeader,
            @Parameter(description = "Doctor UUID (optional, mutually exclusive with other headers)")
            @RequestHeader(value = HEADER_DOCTOR, required = false) String doctorIdHeader,
            @Valid @RequestBody UpdateAppointmentRequest request) {

        validateExactlyOneHeader(adminIdHeader, doctorIdHeader, patientIdHeader);

        UUID adminId = null;
        UUID patientId = null;
        UUID doctorId = null;

        if (isPresent(adminIdHeader)) {
            adminId = parseUuid(adminIdHeader, HEADER_ADMIN);
        } else if (isPresent(patientIdHeader)) {
            patientId = parseUuid(patientIdHeader, HEADER_PATIENT);
        } else {
            doctorId = parseUuid(doctorIdHeader, HEADER_DOCTOR);
        }

        UpdateAppointmentResponse response = appointmentService.updateAppointment(appointmentId, request, adminId, patientId, doctorId);
        return ResponseEntity.ok(response);
    }



    // Cancellazione di un appuntamento DELETE api/appointments/{id} + swagger documentation

    @DeleteMapping(value = "/{appointmentId}")
    @Operation(
            summary = "Elimina un appuntamento",
            description = "Cancellazione di un appuntamento. Richiede esattamente uno dei seguenti header: X-Demo-Admin-Id, X-Demo-Doctor-Id, o X-Demo-Patient-Id. Paziente e Dottore possono cancellare solo i loro appuntamenti. Admin può cancellare qualsiasi appuntamento. La cancellazione deve essere richiesta almeno 2 giorni prima della data dell'appuntamento."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Appointment cancelled successfully"),
            @ApiResponse(responseCode = "400", description = "Bad request - missing or multiple headers"),
            @ApiResponse(responseCode = "403", description = "Forbidden - unauthorized cancellation attempt"),
            @ApiResponse(responseCode = "404", description = "Appointment not found"),
            @ApiResponse(responseCode = "409", description = "Conflict - appointment already cancelled or cancellation deadline passed (must be at least 2 days before appointment)"),
            @ApiResponse(responseCode = "500", description = "Internal server error - unexpected persistence error")
    })
    public ResponseEntity<Void> deleteAppointment(
            @Parameter(description = "UUID of the appointment to delete", required = true, example = "990e8400-e29b-41d4-a716-446655440001")
            @PathVariable UUID appointmentId,
            @Parameter(description = "Admin UUID (optional, mutually exclusive with other headers)")
            @RequestHeader(value = HEADER_ADMIN, required = false) String adminIdHeader,
            @Parameter(description = "Doctor UUID (optional, mutually exclusive with other headers)")
            @RequestHeader(value = HEADER_DOCTOR, required = false) String doctorIdHeader,
            @Parameter(description = "Patient UUID (optional, mutually exclusive with other headers)")
            @RequestHeader(value = HEADER_PATIENT, required = false) String patientIdHeader) {

        validateExactlyOneHeader(adminIdHeader, doctorIdHeader, patientIdHeader);

        UUID adminId = null;
        UUID doctorId = null;
        UUID patientId = null;

        if (isPresent(adminIdHeader)) {
            adminId = parseUuid(adminIdHeader, HEADER_ADMIN);
        } else if (isPresent(doctorIdHeader)) {
            doctorId = parseUuid(doctorIdHeader, HEADER_DOCTOR);
        } else {
            patientId = parseUuid(patientIdHeader, HEADER_PATIENT);
        }
        // Cancellazione dell'appuntamento
        appointmentService.deleteAppointment(appointmentId, adminId, doctorId, patientId);
        return ResponseEntity.noContent().build();
    }
    

    // Validazione che sia presente solo il header del paziente
    private void validatePatientOnlyHeaders(String patient, String admin, String doctor) {
        if (!isPresent(patient)) {
            throw new BadRequestException("X-Demo-Patient-Id header is required");
        }
        if (isPresent(admin)) {
            throw new ForbiddenException("Admin header is not allowed for appointment creation");
        }
        if (isPresent(doctor)) {
            throw new ForbiddenException("Doctor header is not allowed for appointment creation");
        }
    }

    // Validazione che sia presente uno e un solo header
    private void validateExactlyOneHeader(String admin, String doctor, String patient) {
        int count = (isPresent(admin) ? 1 : 0) + (isPresent(doctor) ? 1 : 0) + (isPresent(patient) ? 1 : 0);
        if (count == 0) {
            throw new BadRequestException("Exactly one header required among X-Demo-Admin-Id, X-Demo-Doctor-Id, X-Demo-Patient-Id");
        }
        if (count > 1) {
            throw new BadRequestException("Only one header allowed among X-Demo-Admin-Id, X-Demo-Doctor-Id, X-Demo-Patient-Id");
        }
    }

    private boolean isPresent(String value) {
        return value != null && !value.isBlank();
    }

    private UUID parseUuid(String value, String headerName) {
        try {
            return UUID.fromString(value.trim());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid header: " + headerName);
        }
    }
}
