package com.pegaso.appointments.controller;

import com.pegaso.appointments.dto.exam.CreateExamRequest;
import com.pegaso.appointments.dto.exam.ExamResponse;
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
import org.springframework.web.bind.annotation.GetMapping;
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
}
