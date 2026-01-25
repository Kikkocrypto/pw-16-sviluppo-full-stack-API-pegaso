package com.pegaso.appointments.service;

import com.pegaso.appointments.dto.patient.CreatePatientRequest;
import com.pegaso.appointments.dto.patient.PatientResponse;
import com.pegaso.appointments.dto.patient.UpdatePatientRequest;
import com.pegaso.appointments.entity.Patient;
import com.pegaso.appointments.exception.ConflictException;
import com.pegaso.appointments.exception.ResourceNotFoundException;
import com.pegaso.appointments.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

// Service per la gestione dei pazienti, utilizzato per astrarre la logica di business dalla presentazione (chiama i repository e mantiene il controller pulito)
@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final FieldNormalizationService normalization;
    private final JdbcTemplate jdbcTemplate;




    // Creazione di un nuovo paziente POST api/patients
    @Transactional
    public PatientResponse createPatient(CreatePatientRequest request) {
        String emailToStore = normalization.emailToStore(request.getEmail());
        if (emailToStore != null) {
            if (patientRepository.existsByEmail(emailToStore)) {
                throw new ConflictException("Email already exists: " + emailToStore);
            }
        }
        // Creazione del paziente
        Patient patient = Patient.builder()
                .firstName(normalization.normalizeName(request.getFirstName()))
                .lastName(normalization.normalizeName(request.getLastName()))
                .gender(normalization.normalizeGender(request.getGender()))
                .email(emailToStore)
                .phoneNumber(normalization.normalizeString(request.getPhoneNumber()))
                .dateOfBirth(request.getDateOfBirth())
                .build();

        patient = patientRepository.save(patient);
        return mapToResponse(patient);
    }

    // Mapping del paziente alla risposta
    @Transactional(readOnly = true)
    public PatientResponse getPatientProfile(UUID patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", patientId));
        return mapToResponse(patient);
    }

    // Recupero di tutti i pazienti (Admin)
    @Transactional(readOnly = true)
    public List<PatientResponse> getAllPatients() {
        return patientRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }



    // Aggiornamento del profilo del paziente PATCH api/patients
    @Transactional
    public PatientResponse updatePatientProfile(UUID patientId, UpdatePatientRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", patientId));
        if (request.getFirstName() != null && !request.getFirstName().isBlank()) {
            patient.setFirstName(normalization.normalizeName(request.getFirstName()));
        }
        if (request.getLastName() != null && !request.getLastName().isBlank()) {
            patient.setLastName(normalization.normalizeName(request.getLastName()));
        }
        if (request.getGender() != null && !request.getGender().isBlank()) {
            patient.setGender(normalization.normalizeGender(request.getGender()));
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            String emailToStore = normalization.emailToStore(request.getEmail());
            if (emailToStore != null) {
                patientRepository.findByEmail(emailToStore)
                        .ifPresent(existing -> {
                            if (!existing.getId().equals(patientId)) {
                                throw new ConflictException("Email already exists: " + emailToStore);
                            }
                        });
                patient.setEmail(emailToStore);
            } else {
                patient.setEmail(null);
            }
        }
        if (request.getPhoneNumber() != null) {
            patient.setPhoneNumber(normalization.normalizeString(request.getPhoneNumber()));
        }
        if (request.getDateOfBirth() != null) {
            patient.setDateOfBirth(request.getDateOfBirth());
        }
        patient = patientRepository.save(patient);
        return mapToResponse(patient);
    }


    // Eliminazione del profilo del paziente DELETE api/patients
    @Transactional
    public void deletePatient(UUID patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", patientId));
        if (hasAppointments(patientId)) {
            throw new IllegalArgumentException("Cannot delete patient: patient has active appointments (non-cancelled)");
        }
        // Elimina fisicamente tutti gli appuntamenti cancellati associati al paziente
        // per evitare violazioni di foreign key constraint
        deleteCancelledAppointments(patientId);
        patientRepository.delete(patient);
    }

    private void deleteCancelledAppointments(UUID patientId) {
        jdbcTemplate.update(
                "DELETE FROM appointments WHERE patient_id = ? AND status = 'cancelled'",
                patientId
        );
    }

    private boolean hasAppointments(UUID patientId) {
        Boolean exists = jdbcTemplate.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM appointments WHERE patient_id = ? AND status != 'cancelled')",
                Boolean.class,
                patientId
        );
        return Boolean.TRUE.equals(exists);
    }

    private PatientResponse mapToResponse(Patient patient) {
        return PatientResponse.builder()
                .id(patient.getId())
                .firstName(patient.getFirstName())
                .lastName(patient.getLastName())
                .gender(patient.getGender())
                .email(patient.getEmail())
                .phoneNumber(patient.getPhoneNumber())
                .dateOfBirth(patient.getDateOfBirth())
                .createdAt(patient.getCreatedAt())
                .build();
    }
}
