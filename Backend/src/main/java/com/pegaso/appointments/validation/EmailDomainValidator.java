package com.pegaso.appointments.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.regex.Pattern;

// Validazione dominio email
public class EmailDomainValidator implements ConstraintValidator<ValidEmailDomain, String> {

    private static final Pattern DOMAIN_PATTERN = Pattern.compile(
            "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );

    @Override
    public void initialize(ValidEmailDomain constraintAnnotation) {
    }

    @Override
    public boolean isValid(String email, ConstraintValidatorContext context) {
        if (email == null || email.isBlank()) {
            return true;
        }

        return DOMAIN_PATTERN.matcher(email).matches();
    }
}
