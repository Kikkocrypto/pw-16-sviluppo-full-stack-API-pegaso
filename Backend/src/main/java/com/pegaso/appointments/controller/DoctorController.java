package com.pegaso.appointments.controller;

import com.pegaso.appointments.dto.CreateDoctorRequest;
import com.pegaso.appointments.dto.DoctorResponse;
import com.pegaso.appointments.service.DoctorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// parte fondamentale per la gestione delle API, si occupa di gestire le richieste in arrivo e restituire le risposte (POST)
@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
@Tag(name = "Doctors", description = "API for managing doctors")
public class DoctorController {

    private final DoctorService doctorService;

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
}
