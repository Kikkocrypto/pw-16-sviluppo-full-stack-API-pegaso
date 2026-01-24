package com.pegaso.appointments.controller;

import com.pegaso.appointments.dto.exam.CreateExamRequest;
import com.pegaso.appointments.dto.exam.ExamResponse;
import com.pegaso.appointments.dto.exam.UpdateExamRequest;
import com.pegaso.appointments.service.ExamService;
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


// Controller per la gestione degli esami, utilizzato per gestire le richieste HTTP e restituire le risposte
@RestController
@RequestMapping("/api/exams")
@RequiredArgsConstructor
@Tag(name = "Exams", description = "API for managing exams")
public class ExamController {

    private final ExamService examService;


    // Recupero di tutti gli esami GET api/exams + swagger documentation
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(
            summary = "Get all exams",
            description = "Returns a list of all exams. Requires X-Demo-Admin-Id header."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "List of exams retrieved successfully",
                    content = @Content(schema = @Schema(implementation = ExamResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad request - invalid or missing UUID in X-Demo-Admin-Id"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Admin not found"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal server error - unexpected persistence error"
            )
    })
    public ResponseEntity<List<ExamResponse>> getAllExams(
            @Parameter(description = "UUID of the admin. Required for GET /api/exams.", required = true, example = "880e8400-e29b-41d4-a716-446655440001")
            @RequestHeader(value = "X-Demo-Admin-Id", required = true) String adminIdHeader) {
        UUID adminId;
        try {
            adminId = UUID.fromString(adminIdHeader.trim());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid UUID format");
        }
        List<ExamResponse> response = examService.getAllExams(adminId);
        return ResponseEntity.ok(response);
    }



    // Recupero di un singolo esame GET api/exams/{exam_id} + swagger documentation
    @GetMapping(value = "/{examId}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(
            summary = "Get exam by ID",
            description = "Returns a single exam by its ID. No authentication required."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Exam retrieved successfully",
                    content = @Content(schema = @Schema(implementation = ExamResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad request - invalid UUID format"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Exam not found"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal server error - unexpected persistence error"
            )
    })
    // Recupero di un singolo esame GET api/exams/{exam_id}
    public ResponseEntity<ExamResponse> getExamById(
            @Parameter(description = "UUID of the exam to retrieve", required = true, example = "770e8400-e29b-41d4-a716-446655440001")
            @PathVariable UUID examId) {
        ExamResponse response = examService.getExamById(examId);
        return ResponseEntity.ok(response);
    }




    // Aggiornamento di un esame PATCH api/exams/{exam_id} + swagger documentation
    @PatchMapping(value = "/{examId}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(
            summary = "Update exam",
            description = "Aggiorna un esame. Solo i campi presenti nel body verranno aggiornati (aggiornamento parziale). Il nome non può essere modificato. Richiede l'header X-Demo-Admin-Id."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Exam updated successfully",
                    content = @Content(schema = @Schema(implementation = ExamResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad request - invalid or missing UUID in X-Demo-Admin-Id, invalid duration minutes"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Admin or exam not found"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal server error - unexpected persistence error"
            )
    })
    // Aggiornamento di un esame PATCH api/exams/{exam_id} (solo admin autorizzato + modifica su descrizione, durata e stato)
    public ResponseEntity<ExamResponse> updateExam(
            @Parameter(description = "UUID of the admin. Required for PATCH /api/exams/{examId}.", required = true, example = "880e8400-e29b-41d4-a716-446655440001")
            @RequestHeader(value = "X-Demo-Admin-Id", required = true) String adminIdHeader,
            @Parameter(description = "UUID of the exam to update", required = true, example = "770e8400-e29b-41d4-a716-446655440001")
            @PathVariable UUID examId,
            @Valid @RequestBody UpdateExamRequest request) {
        UUID adminId;
        try {
            adminId = UUID.fromString(adminIdHeader.trim());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid UUID format");
        }
        ExamResponse response = examService.updateExam(adminId, examId, request);
        return ResponseEntity.ok(response);
    }

    // Creazione di un nuovo esame POST api/exams + swagger documentation
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(
            summary = "Crea un nuovo esame",
            description = "Crea un nuovo esame. Il nome deve essere unico. La durata deve essere maggiore di 0. Richiede l'header X-Demo-Admin-Id."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Exam created successfully",
                    content = @Content(schema = @Schema(implementation = ExamResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Bad request - validation failed (required fields, invalid duration minutes, invalid or missing UUID in X-Demo-Admin-Id)"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Admin not found"
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Conflict - exam name already exists"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal server error - unexpected persistence error"
            )
    })
    // Creazione dell'esame
    public ResponseEntity<ExamResponse> createExam(
            @Parameter(description = "UUID of the admin. Required for POST /api/exams.", required = true, example = "880e8400-e29b-41d4-a716-446655440001")
            @RequestHeader(value = "X-Demo-Admin-Id", required = true) String adminIdHeader,
            @Valid @RequestBody CreateExamRequest request) {
        UUID adminId;
        try {
            adminId = UUID.fromString(adminIdHeader.trim());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid UUID format");
        }
        ExamResponse response = examService.createExam(adminId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Eliminazione di un esame DELETE api/exams/{examId}
    @DeleteMapping(value = "/{examId}")
    @Operation(
            summary = "Delete exam",
            description = "Elimina un esame dal catalogo. Richiede l'header X-Demo-Admin-Id. Consentito solo se non esistono prenotazioni associate né abilitazioni dottori (doctor_exams)."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Esame eliminato con successo"),
            @ApiResponse(responseCode = "400", description = "Bad request - invalid or missing UUID in X-Demo-Admin-Id"),
            @ApiResponse(responseCode = "404", description = "Admin or exam not found"),
            @ApiResponse(responseCode = "409", description = "Conflict - exam has associated appointments or doctor_exams"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Void> deleteExam(
            @Parameter(description = "UUID of the admin. Required for DELETE /api/exams/{examId}.", required = true, example = "880e8400-e29b-41d4-a716-446655440001")
            @RequestHeader(value = "X-Demo-Admin-Id", required = true) String adminIdHeader,
            @Parameter(description = "UUID of the exam to delete", required = true, example = "770e8400-e29b-41d4-a716-446655440002")
            @PathVariable UUID examId) {
        UUID adminId;
        try {
            adminId = UUID.fromString(adminIdHeader.trim());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid UUID format");
        }
        examService.deleteExam(adminId, examId);
        return ResponseEntity.noContent().build();
    }
}
