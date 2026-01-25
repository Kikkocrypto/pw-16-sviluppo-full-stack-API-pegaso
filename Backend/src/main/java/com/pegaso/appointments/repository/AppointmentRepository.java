package com.pegaso.appointments.repository;

import com.pegaso.appointments.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    @Query("SELECT a FROM Appointment a JOIN FETCH a.doctor JOIN FETCH a.patient ORDER BY a.scheduledAt ASC")
    List<Appointment> findAllOrderByScheduledAtAsc();

    @Query("SELECT a FROM Appointment a JOIN FETCH a.doctor JOIN FETCH a.patient WHERE a.doctor.id = :doctorId ORDER BY a.scheduledAt ASC")
    List<Appointment> findByDoctorIdOrderByScheduledAtAsc(UUID doctorId);

    @Query("SELECT a FROM Appointment a JOIN FETCH a.doctor JOIN FETCH a.patient WHERE a.patient.id = :patientId ORDER BY a.scheduledAt ASC")
    List<Appointment> findByPatientIdOrderByScheduledAtAsc(UUID patientId);

    // Recupero di un singolo appuntamento con le relazioni caricate
    @Query("SELECT a FROM Appointment a JOIN FETCH a.doctor JOIN FETCH a.patient WHERE a.id = :appointmentId")
    java.util.Optional<Appointment> findByIdWithRelations(UUID appointmentId);

    // Verifica se esiste un appuntamento sovrapposto per un dottore
    @Query(value = "SELECT COUNT(*) > 0 FROM appointments a " +
           "WHERE a.doctor_id = :doctorId " +
           "AND a.status != 'cancelled' " +
           "AND a.scheduled_at < :endTime " +
           "AND (a.scheduled_at + COALESCE(a.duration_minutes, 30) * INTERVAL '1 minute') > :startTime",
           nativeQuery = true)
    boolean existsOverlappingAppointment(@Param("doctorId") UUID doctorId,
                                         @Param("startTime") OffsetDateTime startTime,
                                         @Param("endTime") OffsetDateTime endTime);


    // Verifica se esiste un appuntamento sovrapposto per un dottore, escludendo un appuntamento specifico
    @Query(value = "SELECT COUNT(*) > 0 FROM appointments a " +
           "WHERE a.doctor_id = :doctorId " +
           "AND a.id != :excludeAppointmentId " +
           "AND a.status != 'cancelled' " +
           "AND a.scheduled_at < :endTime " +
           "AND (a.scheduled_at + COALESCE(a.duration_minutes, 30) * INTERVAL '1 minute') > :startTime",
           nativeQuery = true)
    boolean existsOverlappingAppointmentExcluding(@Param("doctorId") UUID doctorId,
                                                   @Param("excludeAppointmentId") UUID excludeAppointmentId,
                                                   @Param("startTime") OffsetDateTime startTime,
                                                   @Param("endTime") OffsetDateTime endTime);

// Recupero degli appuntamenti passati
    @Query(value = "SELECT * FROM appointments a " +
           "WHERE a.status != 'cancelled' " +
           "AND (a.scheduled_at + COALESCE(a.duration_minutes, 30) * INTERVAL '1 minute') < :now",
           nativeQuery = true)
    List<Appointment> findPastAppointments(@Param("now") OffsetDateTime now);
}
