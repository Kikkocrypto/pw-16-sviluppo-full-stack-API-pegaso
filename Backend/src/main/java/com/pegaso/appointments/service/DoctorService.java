package com.pegaso.appointments.service;

import com.pegaso.appointments.dto.CreateDoctorRequest;
import com.pegaso.appointments.dto.DoctorResponse;
import com.pegaso.appointments.entity.Doctor;
import com.pegaso.appointments.entity.DoctorExam;
import com.pegaso.appointments.entity.DoctorExamId;
import com.pegaso.appointments.entity.Exam;
import com.pegaso.appointments.exception.ConflictException;
import com.pegaso.appointments.exception.ResourceNotFoundException;
import com.pegaso.appointments.repository.DoctorExamRepository;
import com.pegaso.appointments.repository.DoctorRepository;
import com.pegaso.appointments.repository.ExamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

// Service per la gestione dei dottori, utilizzato per astrarre la logica di business dalla presentazione (chiama i repository e mantiene il controller pulito)
@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final ExamRepository examRepository;
    private final DoctorExamRepository doctorExamRepository;

    @Transactional
    // Creazione di un nuovo dottore
    public DoctorResponse createDoctor(CreateDoctorRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        
        // Controllo se l'email è già presente
        if (normalizedEmail != null && !normalizedEmail.isBlank()) {
            if (doctorRepository.existsByEmail(normalizedEmail)) {
                throw new ConflictException("Email already exists: " + normalizedEmail);
            }
        }

        Doctor doctor = Doctor.builder()
                .firstName(normalizeName(request.getFirstName()))
                .lastName(normalizeName(request.getLastName()))
                .specialization(normalizeOptionalName(request.getSpecialization()))
                .gender(normalizeGender(request.getGender()))
                .email(normalizedEmail)
                .phoneNumber(normalizeString(request.getPhoneNumber()))
                .build();

        doctor = doctorRepository.save(doctor);

        // Recupero gli esami associati al dottore
       // Se ci sono esami associati, li recupero
        List<UUID> examIds = new ArrayList<>();
        if (request.getExamIds() != null && !request.getExamIds().isEmpty()) {
            // Rimuovo duplicati dall'elenco degli esami
            List<UUID> uniqueExamIds = request.getExamIds().stream()
                    .distinct()
                    .collect(Collectors.toList());
            
            if (uniqueExamIds.size() != request.getExamIds().size()) {
                throw new ConflictException("Duplicate exam IDs are not allowed");
            }
            
            List<Exam> exams = examRepository.findAllByIdIn(uniqueExamIds);
            // Controllo se ci sono esami associati al dottore
            if (exams.size() != uniqueExamIds.size()) {
                List<UUID> foundIds = exams.stream()
                        .map(Exam::getId)
                        .collect(Collectors.toList());
                List<UUID> missingIds = uniqueExamIds.stream()
                        .filter(id -> !foundIds.contains(id))
                        .collect(Collectors.toList());
                throw new ResourceNotFoundException("Exams", missingIds);
            }
            for (Exam exam : exams) {
                if (doctorExamRepository.existsByDoctorIdAndExamId(doctor.getId(), exam.getId())) {
                    throw new ConflictException(
                            String.format("Doctor already associated with exam: %s", exam.getId())
                    );
                }

                DoctorExamId doctorExamId = new DoctorExamId(doctor.getId(), exam.getId());
                DoctorExam doctorExam = DoctorExam.builder()
                        .id(doctorExamId)
                        .doctor(doctor)
                        .exam(exam)
                        .build();
                doctorExamRepository.save(doctorExam);
                examIds.add(exam.getId());
            }
        }
        return mapToResponse(doctor, examIds);
    }

    // Mappo il dottore e gli esami associati al DTO
    private DoctorResponse mapToResponse(Doctor doctor, List<UUID> examIds) {
        return DoctorResponse.builder()
                .id(doctor.getId())
                .firstName(doctor.getFirstName())
                .lastName(doctor.getLastName())
                .specialization(doctor.getSpecialization())
                .gender(doctor.getGender())
                .email(doctor.getEmail())
                .phoneNumber(doctor.getPhoneNumber())
                .createdAt(doctor.getCreatedAt())
                .updatedAt(doctor.getUpdatedAt())
                .examIds(examIds)
                .build();
    }

    private String normalizeName(String name) {
        if (name == null || name.isBlank()) {
            return name;
        }
        String trimmed = name.trim();
        if (trimmed.isEmpty()) {
            return trimmed;
        }
        return trimmed.substring(0, 1).toUpperCase() + trimmed.substring(1).toLowerCase();
    }

    private String normalizeString(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String normalizeOptionalName(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String trimmed = value.trim();
        if (trimmed.isEmpty()) {
            return null;
        }
        return trimmed.substring(0, 1).toUpperCase() + trimmed.substring(1).toLowerCase();
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }
        return email.trim().toLowerCase();
    }

    private String normalizeGender(String gender) {
        if (gender == null || gender.isBlank()) {
            return gender;
        }
        String trimmed = gender.trim();
        if (trimmed.equalsIgnoreCase("M")) {
            return "M";
        } else if (trimmed.equalsIgnoreCase("F")) {
            return "F";
        } else if (trimmed.equalsIgnoreCase("Other")) {
            return "Other";
        }
        return trimmed;
    }
}
