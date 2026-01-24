package com.pegaso.appointments.service;

import com.pegaso.appointments.exception.ValidationException;
import org.springframework.stereotype.Service;

@Service
public class FieldValidationService {

    public void requireNonEmptyWhenPresent(String value, String fieldName) {
        if (value != null && value.trim().isEmpty()) {
            throw new ValidationException(fieldName + " cannot be empty");
        }
    }
}
