package com.pegaso.appointments.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

// Mappatura della tabella doctor_exams tramite spring JPA/Hibernate
@Entity
@Table(name = "doctor_exams")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorExam {

    //lombok per generazione automatica di metodi e costruttori
    @EmbeddedId
    private DoctorExamId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("doctorId")
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("examId")
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
    }
}
