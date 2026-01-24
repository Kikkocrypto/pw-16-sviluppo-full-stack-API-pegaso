package com.pegaso.appointments.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.Set;

public class GenderValidator implements ConstraintValidator<ValidGender, String> {

    private static final Set<String> ALLOWED = Set.of("M", "F", "Other");

    @Override
    public void initialize(ValidGender constraintAnnotation) {
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isBlank()) {
            return true;
        }
        String trimmed = value.trim();
        return ALLOWED.stream().anyMatch(a -> a.equalsIgnoreCase(trimmed));
    }
}
