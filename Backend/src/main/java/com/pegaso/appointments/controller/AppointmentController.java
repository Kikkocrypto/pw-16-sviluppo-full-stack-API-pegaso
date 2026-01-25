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





    // Recupero di un singolo appuntamento GET api/appointments/{appointmentId} + swagger docu
    @GetMapping(value = "/{appointmentId}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(
            summary = "Get appointment by ID",
            description = "Returns a single appointment by its ID. Requires exactly one of X-Demo-Admin-Id, X-Demo-Doctor-Id, or X-Demo-Patient-Id. Admin can view any appointment. Doctor/Patient can only view their own appointments."
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
            summary = "Update appointment",
            description = "Updates an appointment. Requires exactly one of X-Demo-Patient-Id or X-Demo-Doctor-Id. Admin header is not allowed. Patient can modify date, notes and contraindications. Doctor can modify status."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Appointment updated successfully",
                    content = @Content(schema = @Schema(implementation = UpdateAppointmentResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "Bad request - missing or multiple headers, invalid request body, or appointment date not in the future"),
            @ApiResponse(responseCode = "403", description = "Forbidden - admin header present or unauthorized modification attempt"),
            @ApiResponse(responseCode = "404", description = "Appointment not found"),
            @ApiResponse(responseCode = "409", description = "Conflict - business rules violation or time slot not available"),
            @ApiResponse(responseCode = "500", description = "Internal server error - unexpected persistence error")
    })
    // Aggiornamento di un appuntamento 
    public ResponseEntity<UpdateAppointmentResponse> updateAppointment(
            @Parameter(description = "UUID of the appointment to update", required = true, example = "990e8400-e29b-41d4-a716-446655440001")
            @PathVariable UUID appointmentId,
            @Parameter(description = "Patient UUID (optional, mutually exclusive with X-Demo-Doctor-Id)")
            @RequestHeader(value = HEADER_PATIENT, required = false) String patientIdHeader,
            @Parameter(description = "Doctor UUID (optional, mutually exclusive with X-Demo-Patient-Id)")
            @RequestHeader(value = HEADER_DOCTOR, required = false) String doctorIdHeader,
            @Parameter(description = "Admin UUID (not allowed)")
            @RequestHeader(value = HEADER_ADMIN, required = false) String adminIdHeader,
            @Valid @RequestBody UpdateAppointmentRequest request) {

        validatePatientOrDoctorHeaders(patientIdHeader, doctorIdHeader, adminIdHeader);

        UUID patientId = null;
        UUID doctorId = null;

        if (isPresent(patientIdHeader)) {
            patientId = parseUuid(patientIdHeader, HEADER_PATIENT);
        } else {
            doctorId = parseUuid(doctorIdHeader, HEADER_DOCTOR);
        }

        UpdateAppointmentResponse response = appointmentService.updateAppointment(appointmentId, request, patientId, doctorId);
        return ResponseEntity.ok(response);
    }



    // Cancellazione di un appuntamento DELETE api/appointments/{id} + swagger documentation

    @DeleteMapping(value = "/{appointmentId}")
    @Operation(
            summary = "Delete appointment",
            description = "Cancels an appointment (soft delete). Sets appointment status to 'cancelled'. Requires exactly one of X-Demo-Admin-Id, X-Demo-Doctor-Id, or X-Demo-Patient-Id. Patient and Doctor can only cancel their own appointments. Admin can cancel any appointment."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Appointment cancelled successfully (soft delete - status set to 'cancelled')"),
            @ApiResponse(responseCode = "400", description = "Bad request - missing or multiple headers"),
            @ApiResponse(responseCode = "403", description = "Forbidden - unauthorized cancellation attempt"),
            @ApiResponse(responseCode = "404", description = "Appointment not found"),
            @ApiResponse(responseCode = "409", description = "Conflict - appointment already cancelled"),
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
    
    // Validazione che sia presente solo il header del paziente o del dottore
    private void validatePatientOrDoctorHeaders(String patient, String doctor, String admin) {
        if (isPresent(admin)) {
            throw new ForbiddenException("Admin header is not allowed for appointment update");
        }

        int count = (isPresent(patient) ? 1 : 0) + (isPresent(doctor) ? 1 : 0);
        if (count == 0) {
            throw new BadRequestException("Exactly one header required: X-Demo-Patient-Id or X-Demo-Doctor-Id");
        }
        if (count > 1) {
            throw new BadRequestException("Only one header allowed: X-Demo-Patient-Id or X-Demo-Doctor-Id");
        }
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
