package com.pegaso.appointments.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

// Validazione email
@Documented
@Constraint(validatedBy = EmailDomainValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidEmailDomain {

    String message() default "Email must have a valid domain (e.g., .com, .it, .org)";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
