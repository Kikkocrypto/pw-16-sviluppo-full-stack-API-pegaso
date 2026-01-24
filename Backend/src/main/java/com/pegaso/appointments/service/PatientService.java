package com.pegaso.appointments.service;

import com.pegaso.appointments.dto.patient.CreatePatientRequest;
import com.pegaso.appointments.dto.patient.PatientResponse;
import com.pegaso.appointments.entity.Patient;
import com.pegaso.appointments.exception.ConflictException;
import com.pegaso.appointments.exception.ResourceNotFoundException;
import com.pegaso.appointments.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

// Service per la gestione dei pazienti, utilizzato per astrarre la logica di business dalla presentazione (chiama i repository e mantiene il controller pulito)
@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final FieldNormalizationService normalization;

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
