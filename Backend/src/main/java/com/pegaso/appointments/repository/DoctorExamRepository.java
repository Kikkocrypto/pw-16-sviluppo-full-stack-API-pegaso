package com.pegaso.appointments.repository;

import com.pegaso.appointments.entity.DoctorExam;
import com.pegaso.appointments.entity.DoctorExamId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

// Repository per la gestione della relazione N:M tra dottori e esami, utile per gestire le operazioni di CRUD e query sul database
@Repository
public interface DoctorExamRepository extends JpaRepository<DoctorExam, DoctorExamId> {

    List<DoctorExam> findByDoctorId(UUID doctorId);

    boolean existsByDoctorIdAndExamId(UUID doctorId, UUID examId);
}
