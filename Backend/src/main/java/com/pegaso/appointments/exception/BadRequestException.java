package com.pegaso.appointments.exception;

// BadRequestException per la gestione delle eccezioni di richiesta non valida
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}
