package com.pegaso.appointments.exception;

// ResourceNotFoundException per la gestione delle eccezioni di risorsa non trovata
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resource, Object identifier) {
        super(String.format("%s not found with identifier: %s", resource, identifier));
    }
}
