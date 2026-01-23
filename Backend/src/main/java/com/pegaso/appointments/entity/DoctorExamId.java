package com.pegaso.appointments.entity;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

// Mappatura della chiave primaria composta della tabella doctor_exams
@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorExamId implements Serializable {

    private UUID doctorId;
    private UUID examId;
}
