package com.pegaso.appointments.service;

import com.pegaso.appointments.dto.doctor.CreateDoctorRequest;
import com.pegaso.appointments.dto.doctor.DoctorProfileResponse;
import com.pegaso.appointments.dto.doctor.DoctorResponse;
import com.pegaso.appointments.dto.doctor.ExamInfoDto;
import com.pegaso.appointments.dto.doctor.UpdateDoctorRequest;
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
import org.springframework.jdbc.core.JdbcTemplate;
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
    private final JdbcTemplate jdbcTemplate;
    private final FieldNormalizationService normalization;
    private final FieldValidationService validation;

    @Transactional
    // Creazione di un nuovo dottore
    public DoctorResponse createDoctor(CreateDoctorRequest request) {
        String emailToStore = normalization.emailToStore(request.getEmail());
        if (emailToStore != null) {
            if (doctorRepository.existsByEmail(emailToStore)) {
                throw new ConflictException("Email already exists: " + emailToStore);
            }
        }

        Doctor doctor = Doctor.builder()
                .firstName(normalization.normalizeName(request.getFirstName()))
                .lastName(normalization.normalizeName(request.getLastName()))
                .specialization(normalization.normalizeOptionalName(request.getSpecialization()))
                .gender(normalization.normalizeGender(request.getGender()))
                .email(emailToStore)
                .phoneNumber(normalization.normalizeString(request.getPhoneNumber()))
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

    @Transactional(readOnly = true)
    // Recupero il profilo del dottore e gli esami associati
    public DoctorProfileResponse getDoctorProfile(UUID doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", doctorId));
        List<DoctorExam> doctorExams = doctorExamRepository.findById_DoctorId(doctor.getId());
        List<ExamInfoDto> exams = doctorExams.stream()
                .map(de -> ExamInfoDto.builder()
                        .examId(de.getExam().getId())
                        .examName(de.getExam().getName())
                        .description(de.getExam().getDescription())
                        .build())
                .collect(Collectors.toList());
        return DoctorProfileResponse.builder()
                .id(doctor.getId())
                .firstName(doctor.getFirstName())
                .lastName(doctor.getLastName())
                .specialization(doctor.getSpecialization())
                .gender(doctor.getGender())
                .email(doctor.getEmail())
                .phoneNumber(doctor.getPhoneNumber())
                .exams(exams)
                .build();
    }

    // Aggiornamento del profilo del dottore
    @Transactional
    public DoctorProfileResponse updateDoctorProfile(UUID doctorId, UpdateDoctorRequest request) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", doctorId));

        if (request.getFirstName() != null && !request.getFirstName().isBlank()) {
            doctor.setFirstName(normalization.normalizeName(request.getFirstName()));
        }
        if (request.getLastName() != null && !request.getLastName().isBlank()) {
            doctor.setLastName(normalization.normalizeName(request.getLastName()));
        }
        if (request.getSpecialization() != null && !request.getSpecialization().isBlank()) {
            doctor.setSpecialization(normalization.normalizeOptionalName(request.getSpecialization()));
        }
        if (request.getGender() != null && !request.getGender().isBlank()) {
            doctor.setGender(normalization.normalizeGender(request.getGender()));
        }
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank()) {
            doctor.setPhoneNumber(normalization.normalizeString(request.getPhoneNumber()));
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            String emailToStore = normalization.emailToStore(request.getEmail());
            if (emailToStore != null) {
                doctorRepository.findByEmail(emailToStore)
                        .ifPresent(existingDoctor -> {
                            if (!existingDoctor.getId().equals(doctorId)) {
                                throw new ConflictException("Email already exists: " + emailToStore);
                            }
                        });
                doctor.setEmail(emailToStore);
            } else {
                doctor.setEmail(null);
            }
        }

        doctor = doctorRepository.save(doctor);
        // Recupero gli esami associati al dottore
        List<DoctorExam> doctorExams = doctorExamRepository.findById_DoctorId(doctor.getId());
        List<ExamInfoDto> exams = doctorExams.stream()
                .map(de -> ExamInfoDto.builder()
                        .examId(de.getExam().getId())
                        .examName(de.getExam().getName())
                        .description(de.getExam().getDescription())
                        .build())
                .collect(Collectors.toList());

        return DoctorProfileResponse.builder()
                .id(doctor.getId())
                .firstName(doctor.getFirstName())
                .lastName(doctor.getLastName())
                .specialization(doctor.getSpecialization())
                .gender(doctor.getGender())
                .email(doctor.getEmail())
                .phoneNumber(doctor.getPhoneNumber())
                .exams(exams)
                .build();
    }

    // Eliminazione del profilo del dottore
    @Transactional
    public void deleteDoctor(UUID doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", doctorId));
        if (hasAppointments(doctorId)) {
            throw new IllegalArgumentException("Cannot delete doctor: doctor has associated appointments");
        }
        doctorRepository.delete(doctor);
    }

    private boolean hasAppointments(UUID doctorId) {
        Boolean exists = jdbcTemplate.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM appointments WHERE doctor_id = ?)",
                Boolean.class,
                doctorId
        );
        return Boolean.TRUE.equals(exists);
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
}
