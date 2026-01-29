package com.pegaso.appointments.service;

import com.pegaso.appointments.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

// SERVIZIO ATTUALMENTE NON UTILIZZATO
@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentCleanupService {

    private final AppointmentRepository appointmentRepository;

    /**
     * Elimina gli appuntamenti passati (completati).
     * Esegue ogni giorno alle 2:00 AM (cron: second minute hour day month weekday)
     * 
     * Formato cron: "0 0 2 * * ?" = ogni giorno alle 2:00 AM
     */
    
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void deletePastAppointments() {
        log.info("Starting cleanup of past appointments...");
        
        OffsetDateTime now = OffsetDateTime.now();
        var pastAppointments = appointmentRepository.findPastAppointments(now);
        
        if (pastAppointments.isEmpty()) {
            log.info("No past appointments found to delete.");
            return;
        }
        
        int count = pastAppointments.size();
        appointmentRepository.deleteAll(pastAppointments);
        
        log.info("Deleted {} past appointment(s) successfully.", count);
    }
}
