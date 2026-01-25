package com.pegaso.appointments.service;

import org.springframework.stereotype.Service;

// Service per la normalizzazione dei campi (ottimo per evitare duplicazioni di codice, che all'inizio c'erano :))
@Service
public class FieldNormalizationService {

    public String normalizeName(String name) {
        if (name == null || name.isBlank()) {
            return name;
        }
        String trimmed = name.trim();
        if (trimmed.isEmpty()) {
            return trimmed;
        }
        return trimmed.substring(0, 1).toUpperCase() + trimmed.substring(1).toLowerCase();
    }

    public String normalizeOptionalName(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String trimmed = value.trim();
        if (trimmed.isEmpty()) {
            return null;
        }
        return trimmed.substring(0, 1).toUpperCase() + trimmed.substring(1).toLowerCase();
    }

    public String normalizeString(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    public String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }
        return email.trim().toLowerCase();
    }

    public String normalizeGender(String gender) {
        if (gender == null || gender.isBlank()) {
            return null;
        }
        String trimmed = gender.trim();
        if (trimmed.equalsIgnoreCase("M")) {
            return "M";
        }
        if (trimmed.equalsIgnoreCase("F")) {
            return "F";
        }
        if (trimmed.equalsIgnoreCase("Other")) {
            return "Other";
        }
        return trimmed;
    }

    public String emailToStore(String email) {
        String normalized = normalizeEmail(email);
        return (normalized != null && !normalized.isBlank()) ? normalized : null;
    }

    public String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }
        String trimmed = status.trim().toLowerCase();
        if (trimmed.equals("pending") || trimmed.equals("confirmed") || trimmed.equals("cancelled")) {
            return trimmed;
        }
        return trimmed;
    }
}
