package com.pegaso.appointments.service;

import com.pegaso.appointments.dto.appointment.AppointmentCreateResponse;
import com.pegaso.appointments.dto.appointment.AppointmentRequest;
import com.pegaso.appointments.dto.appointment.AppointmentResponse;
import com.pegaso.appointments.entity.Appointment;
import com.pegaso.appointments.entity.Doctor;
import com.pegaso.appointments.entity.DoctorExam;
import com.pegaso.appointments.entity.Exam;
import com.pegaso.appointments.entity.Patient;
import com.pegaso.appointments.exception.BadRequestException;
import com.pegaso.appointments.exception.ConflictException;
import com.pegaso.appointments.exception.ForbiddenException;
import com.pegaso.appointments.exception.ResourceNotFoundException;
import com.pegaso.appointments.repository.AdminRepository;
import com.pegaso.appointments.repository.AppointmentRepository;
import com.pegaso.appointments.repository.DoctorExamRepository;
import com.pegaso.appointments.repository.DoctorRepository;
import com.pegaso.appointments.repository.ExamRepository;
import com.pegaso.appointments.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

// Service per la gestione degli appuntamenti, per astrarre logica di business e avere il controller pulito
@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final AdminRepository adminRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final ExamRepository examRepository;
    private final DoctorExamRepository doctorExamRepository;

    // Recupero degli appuntamenti come admin
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAppointmentsAsAdmin(UUID adminId) {
        if (!adminRepository.existsById(adminId)) {
            throw new ForbiddenException("Accesso non autorizzato");
        }
        return appointmentRepository.findAllOrderByScheduledAtAsc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Recupero degli appuntamenti come dottore
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAppointmentsAsDoctor(UUID doctorId) {
        if (!doctorRepository.existsById(doctorId)) {
            throw new ForbiddenException("Accesso non autorizzato");
        }
        return appointmentRepository.findByDoctorIdOrderByScheduledAtAsc(doctorId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Recupero degli appuntamenti come paziente
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAppointmentsAsPatient(UUID patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new ForbiddenException("Accesso non autorizzato");
        }
        return appointmentRepository.findByPatientIdOrderByScheduledAtAsc(patientId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }



    // Creazione di un nuovo appuntamento POST api/appointments
    @Transactional
    public AppointmentCreateResponse createAppointment(UUID patientId, AppointmentRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        Exam exam = examRepository.findById(request.getExamId())
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));

        if (!exam.getIsActive()) {
            throw new BadRequestException("Exam is not active");
        }

        List<DoctorExam> doctorExams = doctorExamRepository.findByExamIdWithDoctor(request.getExamId());
        if (doctorExams.isEmpty()) {
            throw new ConflictException("No doctors are authorized for this exam");
        }

        OffsetDateTime scheduledAt = request.getAppointmentDate()
                .atZone(ZoneOffset.UTC)
                .toOffsetDateTime();

        if (scheduledAt.isBefore(OffsetDateTime.now())) {
            throw new BadRequestException("Appointment date must be in the future");
        }

        Integer durationMinutes = exam.getDurationMinutes();
        OffsetDateTime endTime = scheduledAt.plusMinutes(durationMinutes);

        Doctor availableDoctor = null;
        for (DoctorExam doctorExam : doctorExams) {
            Doctor doctor = doctorExam.getDoctor();
            if (!appointmentRepository.existsOverlappingAppointment(doctor.getId(), scheduledAt, endTime)) {
                availableDoctor = doctor;
                break;
            }
        }

        if (availableDoctor == null) {
            throw new ConflictException("No doctors are available at the requested time slot for this exam");
        }

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(availableDoctor)
                .exam(exam)
                .scheduledAt(scheduledAt)
                .durationMinutes(durationMinutes)
                .status("pending")
                .reason(request.getNotes())
                .build();

        Appointment savedAppointment = appointmentRepository.save(appointment);

        return mapToCreateResponse(savedAppointment);
    }



    // mapping dell'appuntamento alla risposta di creazione
    private AppointmentCreateResponse mapToCreateResponse(Appointment appointment) {
        LocalDateTime appointmentDate = appointment.getScheduledAt() == null
                ? null
                : appointment.getScheduledAt().atZoneSameInstant(ZoneOffset.UTC).toLocalDateTime();

        return AppointmentCreateResponse.builder()
                .id(appointment.getId())
                .appointmentDate(appointmentDate)
                .doctorId(appointment.getDoctor().getId())
                .patientId(appointment.getPatient().getId())
                .status(appointment.getStatus())
                .build();
    }




    // mapping dell'appuntamento alla risposta per dottore, paziente e admin
    private AppointmentResponse mapToResponse(Appointment a) {
        LocalDateTime appointmentDate = a.getScheduledAt() == null
                ? null
                : a.getScheduledAt().atZoneSameInstant(ZoneOffset.UTC).toLocalDateTime();
        return AppointmentResponse.builder()
                .id(a.getId())
                .appointmentDate(appointmentDate)
                .doctorId(a.getDoctor().getId())
                .doctorFirstName(a.getDoctor().getFirstName())
                .doctorLastName(a.getDoctor().getLastName())
                .patientId(a.getPatient().getId())
                .patientFirstName(a.getPatient().getFirstName())
                .patientLastName(a.getPatient().getLastName())
                .status(a.getStatus())
                .build();
    }
}
