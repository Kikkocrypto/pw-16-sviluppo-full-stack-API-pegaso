package com.pegaso.appointments.controller;

import com.pegaso.appointments.dto.appointment.AppointmentCreateResponse;
import com.pegaso.appointments.dto.appointment.AppointmentRequest;
import com.pegaso.appointments.dto.appointment.AppointmentResponse;
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
import org.springframework.web.bind.annotation.GetMapping;
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
            summary = "List appointments",
            description = "Returns appointments. Requires exactly one of X-Demo-Admin-Id, X-Demo-Doctor-Id, or X-Demo-Patient-Id. Admin: all appointments. Doctor/Patient: filtered by respective id."
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
            summary = "Create appointment",
            description = "Creates a new appointment. Requires X-Demo-Patient-Id header. Admin and Doctor headers are not allowed."
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
