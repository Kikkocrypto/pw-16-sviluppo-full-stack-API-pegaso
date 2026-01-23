package com.pegaso.appointments.repository;

import com.pegaso.appointments.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
// Repository per la gestione dei dottori, utile per gestire le operazioni di CRUD e query sul database
@Repository
public interface DoctorRepository extends JpaRepository<Doctor, UUID> {

    Optional<Doctor> findByEmail(String email);

    boolean existsByEmail(String email);
}
