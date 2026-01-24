package com.pegaso.appointments.repository;

import com.pegaso.appointments.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

// Repository per la gestione degli esami
@Repository
public interface ExamRepository extends JpaRepository<Exam, UUID> {

    List<Exam> findAllByIdIn(List<UUID> ids);

    boolean existsByName(String name);
}
