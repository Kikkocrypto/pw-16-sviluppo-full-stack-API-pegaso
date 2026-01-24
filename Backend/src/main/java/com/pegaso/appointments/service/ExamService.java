package com.pegaso.appointments.service;

import com.pegaso.appointments.dto.exam.CreateExamRequest;
import com.pegaso.appointments.dto.exam.ExamResponse;
import com.pegaso.appointments.entity.Exam;
import com.pegaso.appointments.exception.ConflictException;
import com.pegaso.appointments.exception.ResourceNotFoundException;
import com.pegaso.appointments.repository.AdminRepository;
import com.pegaso.appointments.repository.ExamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

// Service per la gestione degli esami, per astrarre logica di business e presentazione
@Service
@RequiredArgsConstructor
public class ExamService {

    private final ExamRepository examRepository;
    private final AdminRepository adminRepository;
    private final FieldNormalizationService normalization;


    // Creazione di un nuovo esame POST api/exams
    @Transactional
    public ExamResponse createExam(UUID adminId, CreateExamRequest request) {
        adminRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin", adminId));

        String normalizedName = normalization.normalizeName(request.getName());
        if (examRepository.existsByName(normalizedName)) {
            throw new ConflictException("Exam name already exists: " + normalizedName);
        }

        // Creazione dell'esame
        Exam exam = Exam.builder()
                .name(normalizedName)
                .description(normalization.normalizeOptionalName(request.getDescription()))
                .durationMinutes(request.getDurationMinutes())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        exam = examRepository.save(exam);
        return mapToResponse(exam);
    }

    // Mapping dell'esame alla risposta
    private ExamResponse mapToResponse(Exam exam) {
        return ExamResponse.builder()
                .id(exam.getId())
                .name(exam.getName())
                .description(exam.getDescription())
                .durationMinutes(exam.getDurationMinutes())
                .isActive(exam.getIsActive())
                .createdAt(exam.getCreatedAt())
                .updatedAt(exam.getUpdatedAt())
                .build();
    }
}
