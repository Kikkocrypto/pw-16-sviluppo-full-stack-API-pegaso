package com.pegaso.appointments.controller;

import com.pegaso.appointments.dto.exam.ExamResponse;
import com.pegaso.appointments.service.ExamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;


// Controller per la gestione degli esami, utilizzato per gestire le richieste HTTP e restituire le risposte (solo api pubblici)
@RestController
@RequestMapping("/api/exams")
@RequiredArgsConstructor
@Tag(name = "Exams", description = "API for managing exams")
public class ExamController {

    private final ExamService examService;


    // Recupero di tutti gli esami GET api/exams + swagger (pubblico)
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(
            summary = "Recupera tutti gli esami",
            description = "Recupera la lista di tutti gli esami. Non richiede autenticazione. Endpoint pubblico."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "List of exams retrieved successfully",
                    content = @Content(schema = @Schema(implementation = ExamResponse.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal server error - unexpected persistence error"
            )
    })
    public ResponseEntity<List<ExamResponse>> getAllExams() {
        List<ExamResponse> response = examService.getAllExams();
        return ResponseEntity.ok(response);
    }



    // Recupero di un singolo esame GET api/exams/{exam_id} + swagger documentation
    @GetMapping(value = "/{examId}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(
            summary = "Recupera un esame by ID",
            description = "Recupera un esame in base all'ID. Non richiede autenticazione."
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




}
