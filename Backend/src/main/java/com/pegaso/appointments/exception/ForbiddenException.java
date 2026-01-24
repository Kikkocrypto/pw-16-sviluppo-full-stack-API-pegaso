package com.pegaso.appointments.exception;

// ForbiddenException per la gestione delle eccezioni di accesso non autorizzato
public class ForbiddenException extends RuntimeException {

    public ForbiddenException(String message) {
        super(message);
    }
}
