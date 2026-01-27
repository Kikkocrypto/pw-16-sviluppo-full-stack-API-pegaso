package com.pegaso.appointments.service;

import com.pegaso.appointments.dto.appointment.AppointmentCreateResponse;
import com.pegaso.appointments.dto.appointment.AppointmentRequest;
import com.pegaso.appointments.dto.appointment.AppointmentResponse;
import com.pegaso.appointments.dto.appointment.UpdateAppointmentRequest;
import com.pegaso.appointments.dto.appointment.UpdateAppointmentResponse;
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
    private final FieldNormalizationService normalization;

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




    // Recupero di un singolo appuntamento GET api/appointments/{appointmentId}
    @Transactional(readOnly = true)
    public AppointmentResponse getAppointmentById(UUID appointmentId, UUID adminId, UUID doctorId, UUID patientId) {
        Appointment appointment = appointmentRepository.findByIdWithRelations(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        // Verifica autorizzazione
        if (adminId != null) {
            if (!adminRepository.existsById(adminId)) {
                throw new ForbiddenException("Accesso non autorizzato");
            }
        } else if (doctorId != null) {
            if (!doctorRepository.existsById(doctorId)) {
                throw new ForbiddenException("Accesso non autorizzato");
            }
            if (!appointment.getDoctor().getId().equals(doctorId)) {
                throw new ForbiddenException("Non sei autorizzato a visualizzare questo appuntamento");
            }
        } else if (patientId != null) {
            if (!patientRepository.existsById(patientId)) {
                throw new ForbiddenException("Accesso non autorizzato");
            }
            if (!appointment.getPatient().getId().equals(patientId)) {
                throw new ForbiddenException("Non sei autorizzato a visualizzare questo appuntamento");
            }
        }

        return mapToResponse(appointment);
    }



    // Creazione di un nuovo appuntamento POST api/appointments
    @Transactional
    public AppointmentCreateResponse createAppointment(UUID patientId, AppointmentRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Paziente non trovato"));

        Exam exam = examRepository.findById(request.getExamId())
                .orElseThrow(() -> new ResourceNotFoundException("Esame non trovato"));

        if (!exam.getIsActive()) {
            throw new BadRequestException("L'esame non è attivo");
        }

        List<DoctorExam> doctorExams = doctorExamRepository.findByExamIdWithDoctor(request.getExamId());
        if (doctorExams.isEmpty()) {
            throw new ConflictException("Nessun dottore è autorizzato a svolgere questo esame");
        }

        OffsetDateTime scheduledAt = request.getAppointmentDate()
                .atZone(ZoneOffset.UTC)
                .toOffsetDateTime();

        if (scheduledAt.isBefore(OffsetDateTime.now())) {
            throw new BadRequestException("La data dell'appuntamento deve essere nel futuro");
        }

        Integer durationMinutes = exam.getDurationMinutes();
        OffsetDateTime endTime = scheduledAt.plusMinutes(durationMinutes);

        // Verifica se il paziente ha già un appuntamento sovrapposto
        if (appointmentRepository.existsOverlappingAppointmentForPatient(patientId, scheduledAt, endTime)) {
            throw new ConflictException("Hai già un appuntamento sovrapposto");
        }

        Doctor availableDoctor = null;
        if (request.getDoctorId() != null) {
            Doctor requestedDoctor = doctorRepository.findById(request.getDoctorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
            
            // Verifica se il dottore è abilitato per questo esame
            if (!doctorExamRepository.existsByDoctorIdAndExamId(requestedDoctor.getId(), exam.getId())) {
                throw new BadRequestException("Il dottore richiesto non è autorizzato a svolgere questo esame");
            }

            // Verifica disponibilità del dottore richiesto
            if (appointmentRepository.existsOverlappingAppointment(requestedDoctor.getId(), scheduledAt, endTime)) {
                throw new ConflictException("Il dottore richiesto non è disponibile a questo orario");
            }
            availableDoctor = requestedDoctor;
        } else {
            for (DoctorExam doctorExam : doctorExams) {
                Doctor doctor = doctorExam.getDoctor();
                if (!appointmentRepository.existsOverlappingAppointment(doctor.getId(), scheduledAt, endTime)) {
                    availableDoctor = doctor;
                    break;
                }
            }
        }

        if (availableDoctor == null) {
            throw new ConflictException("Nessun dottore è disponibile a questo orario per questo esame");
        }

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(availableDoctor)
                .exam(exam)
                .scheduledAt(scheduledAt)
                .durationMinutes(durationMinutes)
                .status("pending")
                .reason(request.getReason())
                .contraindications(request.getContraindications())
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
                .patientEmail(appointment.getPatient().getEmail())
                .status(appointment.getStatus())
                .reason(appointment.getReason())
                .contraindications(appointment.getContraindications())
                .examName(appointment.getExam().getName())
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
                .doctorGender(a.getDoctor().getGender())
                .patientId(a.getPatient().getId())
                .patientFirstName(a.getPatient().getFirstName())
                .patientLastName(a.getPatient().getLastName())
                .patientEmail(a.getPatient().getEmail())
                .status(a.getStatus())
                .reason(a.getReason())
                .contraindications(a.getContraindications())
                .durationMinutes(a.getDurationMinutes())
                .examName(a.getExam().getName())
                .build();
    }



    // Aggiornamento di un appuntamento PATCH api/appointments/{id}
    @Transactional
    public UpdateAppointmentResponse updateAppointment(UUID appointmentId, UpdateAppointmentRequest request, UUID adminId, UUID patientId, UUID doctorId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (adminId != null) {
            if (!adminRepository.existsById(adminId)) {
                throw new ForbiddenException("Accesso non autorizzato");
            }
            // Admin può modificare tutto (data, status, reason, contraindications)
        } else if (patientId != null) {
            if (!appointment.getPatient().getId().equals(patientId)) {
                throw new ForbiddenException("Non sei autorizzato a modificare questo appuntamento");
            }
            if (request.getStatus() != null) {
                throw new ConflictException("Il paziente non può modificare lo stato dell'appuntamento");
            }
            // Il paziente può modificare la data solo se mancano almeno 2 giorni
            if (request.getAppointmentDate() != null) {
                OffsetDateTime now = OffsetDateTime.now();
                OffsetDateTime currentAppointmentDate = appointment.getScheduledAt();
                OffsetDateTime reschedulingDeadline = currentAppointmentDate.minusDays(2);
                
                if (now.isAfter(reschedulingDeadline) || now.isEqual(reschedulingDeadline)) {
                    throw new ConflictException("L'appuntamento non può essere spostato. La modifica deve essere richiesta almeno 2 giorni prima della data originale.");
                }
            }
        } else if (doctorId != null) {
            if (!appointment.getDoctor().getId().equals(doctorId)) {
                throw new ForbiddenException("Non sei autorizzato a modificare questo appuntamento");
            }
            if (request.getAppointmentDate() != null || request.getReason() != null || request.getContraindications() != null) {
                throw new ConflictException("Il dottore può solo modificare lo stato dell'appuntamento");
            }
        }

        // Se la data dell'appuntamento è cambiata, verifico che non sia sovrapposta ad un altro appuntamento
        // Solo admin può modificare la data
        if (request.getAppointmentDate() != null) {
            OffsetDateTime scheduledAt = request.getAppointmentDate()
                    .atZone(ZoneOffset.UTC)
                    .toOffsetDateTime();

            if (scheduledAt.isBefore(OffsetDateTime.now())) {
                throw new BadRequestException("Appointment date must be in the future");
            }
            // Calcolo la fine dell'appuntamento
            Integer durationMinutes = appointment.getDurationMinutes() != null 
                    ? appointment.getDurationMinutes() 
                    : 30;
            OffsetDateTime endTime = scheduledAt.plusMinutes(durationMinutes);
            // Verifico che non sia sovrapposta ad un altro appuntamento per il dottore
            if (appointmentRepository.existsOverlappingAppointmentExcluding(
                    appointment.getDoctor().getId(), 
                    appointment.getId(), 
                    scheduledAt, 
                    endTime)) {
                throw new ConflictException("Il dottore non è disponibile a questo orario");
            }

            // Verifico che non sia sovrapposta ad un altro appuntamento per il paziente
            if (appointmentRepository.existsOverlappingAppointmentForPatientExcluding(
                    appointment.getPatient().getId(),
                    appointment.getId(),
                    scheduledAt,
                    endTime)) {
                throw new ConflictException("Hai già un altro appuntamento in questa fascia oraria");
            }

            appointment.setScheduledAt(scheduledAt);
        }
        // Se lo stato dell'appuntamento è cambiato, verifico che sia valido
        if (request.getStatus() != null) {
            String normalizedStatus = normalization.normalizeStatus(request.getStatus());
            if (normalizedStatus == null || 
                (!normalizedStatus.equals("pending") && 
                 !normalizedStatus.equals("confirmed") && 
                 !normalizedStatus.equals("cancelled") &&
                 !normalizedStatus.equals("completed"))) {
                throw new BadRequestException("Stato non valido. I valori consentiti sono: pending, confirmed, cancelled, completed");
            }
            appointment.setStatus(normalizedStatus);
        }

        if (request.getReason() != null) {
            appointment.setReason(request.getReason().trim().isEmpty() ? null : request.getReason().trim());
        }

        if (request.getContraindications() != null) {
            appointment.setContraindications(request.getContraindications().trim().isEmpty() ? null : request.getContraindications().trim());
        }

        Appointment updatedAppointment = appointmentRepository.save(appointment);
        return mapToUpdateResponse(updatedAppointment);
    }



    // Cancellazione di un appuntamento DELETE api/appointments/{id}
    @Transactional
    public void deleteAppointment(UUID appointmentId, UUID adminId, UUID doctorId, UUID patientId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (adminId != null) {
            if (!adminRepository.existsById(adminId)) {
                throw new ForbiddenException("Accesso non autorizzato");
            }
        } else if (doctorId != null) {
            if (!doctorRepository.existsById(doctorId)) {
                throw new ForbiddenException("Accesso non autorizzato");
            }
            if (!appointment.getDoctor().getId().equals(doctorId)) {
                throw new ForbiddenException("Non sei autorizzato a cancellare questo appuntamento");
            }
        } else if (patientId != null) {
            if (!patientRepository.existsById(patientId)) {
                throw new ForbiddenException("Accesso non autorizzato");
            }
            if (!appointment.getPatient().getId().equals(patientId)) {
                throw new ForbiddenException("Non sei autorizzato a cancellare questo appuntamento");
            }
        }

        if ("cancelled".equals(appointment.getStatus())) {
            throw new ConflictException("L'appuntamento è già cancellato");
        }

        // Se l'appuntamento è completato, lo eliminiamo fisicamente dal DB
        if ("completed".equals(appointment.getStatus())) {
            appointmentRepository.delete(appointment);
            return;
        }

        // Verifica che l'appuntamento possa essere annullato (almeno 2 giorni prima)
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime appointmentDate = appointment.getScheduledAt();
        
        OffsetDateTime cancellationDeadline = appointmentDate.minusDays(2);
        
        if (now.isAfter(cancellationDeadline) || now.isEqual(cancellationDeadline)) {
            throw new ConflictException("L'appuntamento non può essere cancellato. La cancellazione deve essere richiesta almeno 2 giorni prima della data dell'appuntamento.");
        }

        appointment.setStatus("cancelled");
        appointmentRepository.save(appointment);
    }




    // mapping dell'appuntamento alla risposta di aggiornamento 
    private UpdateAppointmentResponse mapToUpdateResponse(Appointment appointment) {
        LocalDateTime appointmentDate = appointment.getScheduledAt() == null
                ? null
                : appointment.getScheduledAt().atZoneSameInstant(ZoneOffset.UTC).toLocalDateTime();

        return UpdateAppointmentResponse.builder()
                .id(appointment.getId())
                .appointmentDate(appointmentDate)
                .patientId(appointment.getPatient().getId())
                .patientEmail(appointment.getPatient().getEmail())
                .status(appointment.getStatus())
                .reason(appointment.getReason())
                .contraindications(appointment.getContraindications())
                .examName(appointment.getExam().getName())
                .build();
    }
}
