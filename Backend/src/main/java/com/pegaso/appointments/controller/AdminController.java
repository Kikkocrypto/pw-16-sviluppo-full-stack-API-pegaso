package com.pegaso.appointments.controller;

import com.pegaso.appointments.dto.doctor.DoctorProfileResponse;
import com.pegaso.appointments.dto.exam.CreateExamRequest;
import com.pegaso.appointments.dto.exam.ExamResponse;
import com.pegaso.appointments.dto.exam.UpdateExamRequest;
import com.pegaso.appointments.dto.patient.PatientResponse;
import com.pegaso.appointments.exception.BadRequestException;
import com.pegaso.appointments.exception.ForbiddenException;
import com.pegaso.appointments.repository.AdminRepository;
import com.pegaso.appointments.service.DoctorService;
import com.pegaso.appointments.service.ExamService;
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

import java.util.List;
import java.util.UUID;

// Controller per la gestione degli endpoint esclusivi per l'admin
//
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "API for admin operations")
public class AdminController {

    private static final String HEADER_ADMIN = "X-Demo-Admin-Id";

    private final ExamService examService;
    private final PatientService patientService;
    private final DoctorService doctorService;
    private final AdminRepository adminRepository;

    // Creazione di un nuovo esame POST /api/admin/exams
    @PostMapping(value = "/exams", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(
            summary = "Create a new exam (Admin)",
            description = "Creates a new exam in the catalog. Requires X-Demo-Admin-Id header."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Exam created successfully",
                    content = @Content(schema = @Schema(implementation = ExamResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad request - validation failed (name required, name empty, durationMinutes <= 0)"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - admin not authorized"
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Conflict - exam name already exists"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal server error"
            )
    })
    public ResponseEntity<ExamResponse> createExam(
            @Parameter(description = "UUID of the admin. Required.", required = true, example = "880e8400-e29b-41d4-a716-446655440001")
            @RequestHeader(value = HEADER_ADMIN, required = false) String adminIdHeader,
            @Valid @RequestBody CreateExamRequest request) {

        validateAdminHeader(adminIdHeader);
        UUID adminId = parseUuid(adminIdHeader, HEADER_ADMIN);

        if (!adminRepository.existsById(adminId)) {
            throw new ForbiddenException("Accesso non autorizzato");
        }

        ExamResponse response = examService.createExam(adminId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Modifica di un esame PATCH /api/admin/exams/{examId}
    @PatchMapping(value = "/exams/{examId}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(
            summary = "Update an exam (Admin)",
            description = "Updates an existing exam. Requires X-Demo-Admin-Id header. Only fields present in the body are updated (partial update)."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Exam updated successfully",
                    content = @Content(schema = @Schema(implementation = ExamResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad request - validation failed (durationMinutes <= 0)"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - admin not authorized"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Exam not found"
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Conflict - exam name already exists (if name is changed)"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal server error"
            )
    })
    public ResponseEntity<ExamResponse> updateExam(
            @Parameter(description = "UUID of the exam to update", required = true, example = "770e8400-e29b-41d4-a716-446655440001")
            @PathVariable UUID examId,
            @Parameter(description = "UUID of the admin. Required.", required = true, example = "880e8400-e29b-41d4-a716-446655440001")
            @RequestHeader(value = HEADER_ADMIN, required = false) String adminIdHeader,
            @Valid @RequestBody UpdateExamRequest request) {

        validateAdminHeader(adminIdHeader);
        UUID adminId = parseUuid(adminIdHeader, HEADER_ADMIN);

        if (!adminRepository.existsById(adminId)) {
            throw new ForbiddenException("Accesso non autorizzato");
        }

        ExamResponse response = examService.updateExam(adminId, examId, request);
        return ResponseEntity.ok(response);
    }

    // Eliminazione di un esame DELETE /api/admin/exams/{examId}
    @DeleteMapping(value = "/exams/{examId}")
    @Operation(
            summary = "Delete an exam (Admin)",
            description = "Deletes an exam from the catalog. Requires X-Demo-Admin-Id header."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "204",
                    description = "Exam deleted successfully"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad request - invalid UUID format"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - admin not authorized"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Exam not found"
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Conflict - exam has associated appointments or doctor exams"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal server error"
            )
    })
    public ResponseEntity<Void> deleteExam(
            @Parameter(description = "UUID of the exam to delete", required = true, example = "770e8400-e29b-41d4-a716-446655440001")
            @PathVariable UUID examId,
            @Parameter(description = "UUID of the admin. Required.", required = true, example = "880e8400-e29b-41d4-a716-446655440001")
            @RequestHeader(value = HEADER_ADMIN, required = false) String adminIdHeader) {

        validateAdminHeader(adminIdHeader);
        UUID adminId = parseUuid(adminIdHeader, HEADER_ADMIN);

        if (!adminRepository.existsById(adminId)) {
            throw new ForbiddenException("Accesso non autorizzato");
        }

        examService.deleteExam(adminId, examId);
        return ResponseEntity.noContent().build();
    }




    // Lista tutti i pazienti GET /api/admin/patients
    @GetMapping(value = "/patients", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(
            summary = "Get all patients (Admin)",
            description = "recupera la lista di tutti i pazienti registrati nel sistema. Richiede l'header X-Demo-Admin-Id."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "List of patients retrieved successfully",
                    content = @Content(schema = @Schema(implementation = PatientResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad request - invalid UUID format"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - admin not authorized"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal server error"
            )
    })
    // Recupero della lista di tutti i pazienti + verifica che sia presente l'header ADMIN
    public ResponseEntity<List<PatientResponse>> getAllPatients(
            @Parameter(description = "UUID of the admin. Required.", required = true, example = "880e8400-e29b-41d4-a716-446655440001")
            @RequestHeader(value = HEADER_ADMIN, required = false) String adminIdHeader) {

        validateAdminHeader(adminIdHeader);
        UUID adminId = parseUuid(adminIdHeader, HEADER_ADMIN);

        if (!adminRepository.existsById(adminId)) {
            throw new ForbiddenException("Accesso non autorizzato");
        }

        List<PatientResponse> response = patientService.getAllPatients();
        return ResponseEntity.ok(response);
    }




    // Lista tutti i dottori GET /api/admin/doctors
    @GetMapping(value = "/doctors", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(
            summary = "Get all doctors (Admin)",
            description = "Returns a list of all doctors registered in the system. Requires X-Demo-Admin-Id header."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "List of doctors retrieved successfully",
                    content = @Content(schema = @Schema(implementation = DoctorProfileResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad request - invalid UUID format"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - admin not authorized"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal server error"
            )
    })
    public ResponseEntity<List<DoctorProfileResponse>> getAllDoctors(
            @Parameter(description = "UUID of the admin. Required.", required = true, example = "880e8400-e29b-41d4-a716-446655440001")
            @RequestHeader(value = HEADER_ADMIN, required = false) String adminIdHeader) {

        validateAdminHeader(adminIdHeader);
        UUID adminId = parseUuid(adminIdHeader, HEADER_ADMIN);

        if (!adminRepository.existsById(adminId)) {
            throw new ForbiddenException("Accesso non autorizzato");
        }

        List<DoctorProfileResponse> response = doctorService.getAllDoctors();
        return ResponseEntity.ok(response);
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
