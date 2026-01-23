package com.pegaso.appointments.validation;

import com.google.i18n.phonenumbers.NumberParseException;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
import com.google.i18n.phonenumbers.Phonenumber;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

// Validazione numero di telefono con google libphonenumber (sia internazionale che nazionale)
public class PhoneNumberValidator implements ConstraintValidator<ValidPhoneNumber, String> {

    private static final PhoneNumberUtil phoneNumberUtil = PhoneNumberUtil.getInstance();

    @Override
    public void initialize(ValidPhoneNumber constraintAnnotation) {
    }

    @Override
    public boolean isValid(String phoneNumber, ConstraintValidatorContext context) {
        if (phoneNumber == null || phoneNumber.isBlank()) {
            return true;
        }

        try {
            Phonenumber.PhoneNumber number = phoneNumberUtil.parse(phoneNumber, null);
            return phoneNumberUtil.isValidNumber(number);
        } catch (NumberParseException e) {
            return false;
        }
    }
}
