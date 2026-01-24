package com.pegaso.appointments.repository;

import com.pegaso.appointments.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

// Repository per la gestione dei pazienti, operazioni di CRUD e query sul database
@Repository
public interface PatientRepository extends JpaRepository<Patient, UUID> {

    Optional<Patient> findByEmail(String email);

    boolean existsByEmail(String email);
}
