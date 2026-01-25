package com.pegaso.appointments.service;

import com.pegaso.appointments.dto.exam.CreateExamRequest;
import com.pegaso.appointments.dto.exam.ExamResponse;
import com.pegaso.appointments.dto.exam.UpdateExamRequest;
import com.pegaso.appointments.entity.Exam;
import com.pegaso.appointments.exception.ConflictException;
import com.pegaso.appointments.exception.ResourceNotFoundException;
import com.pegaso.appointments.repository.AdminRepository;
import com.pegaso.appointments.repository.ExamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

// Service per la gestione degli esami, per astrarre logica di business e presentazione
@Service
@RequiredArgsConstructor
public class ExamService {

    private final ExamRepository examRepository;
    private final AdminRepository adminRepository;
    private final FieldNormalizationService normalization;
    private final JdbcTemplate jdbcTemplate;


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


    // Recupero di tutti gli esami GET api/exams (pubblico)
    @Transactional(readOnly = true)
    public List<ExamResponse> getAllExams() {
        return examRepository.findAll().stream()
                .sorted(Comparator.comparing(Exam::getName))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Recupero di un singolo esame GET api/exams/{exam_id}
    @Transactional(readOnly = true)
    public ExamResponse getExamById(UUID examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam", examId));
        return mapToResponse(exam);
    }

    
    
    // Aggiornamento di un esame PATCH api/exams
    @Transactional
    public ExamResponse updateExam(UUID adminId, UUID examId, UpdateExamRequest request) {
        adminRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin", adminId));

        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam", examId));

        if (request.getDescription() != null) {
            exam.setDescription(normalization.normalizeOptionalName(request.getDescription()));
        }
        if (request.getDurationMinutes() != null) {
            exam.setDurationMinutes(request.getDurationMinutes());
        }
        if (request.getIsActive() != null) {
            exam.setIsActive(request.getIsActive());
        }

        exam = examRepository.save(exam);
        return mapToResponse(exam);
    }




    // Eliminazione di un esame DELETE api/exams/{examId}
    @Transactional
    public void deleteExam(UUID adminId, UUID examId) {
        adminRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin", adminId));

        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam", examId));
        if (hasAppointments(examId)) {
            throw new ConflictException(
                    "Impossibile eliminare l'esame: esistono prenotazioni associate. Elimina prima le prenotazioni o annullale.");
        }
        if (hasDoctorExams(examId)) {
            throw new ConflictException(
                    "Impossibile eliminare l'esame: esistono dottori abilitati a questo esame. Rimuovi prima le abilitazioni.");
        }
        examRepository.delete(exam);
    }

    // Verifica se esistono prenotazioni associate all'esame
    private boolean hasAppointments(UUID examId) {
        Boolean exists = jdbcTemplate.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM appointments WHERE exam_id = ?)",
                Boolean.class,
                examId
        );
        return Boolean.TRUE.equals(exists);
    }
    // Verifica se esistono dottori abilitati all'esame
    private boolean hasDoctorExams(UUID examId) {
        Boolean exists = jdbcTemplate.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM doctor_exams WHERE exam_id = ?)",
                Boolean.class,
                examId
        );
        return Boolean.TRUE.equals(exists);
    }

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
