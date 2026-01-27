import { validatePhoneNumber } from './phoneUtils';

// Validazioni condivise per pazienti e dottori

// Valida un campo nome (firstName o lastName)
export function validateName(value, required = true) {
  if (!value || !value.trim()) {
    return required ? 'Il nome è obbligatorio' : null;
  }
  
  const trimmed = value.trim();
  
  if (trimmed.length < 2) {
    return 'Deve contenere almeno 2 caratteri';
  }
  
  if (trimmed.length > 100) {
    return 'Non può superare i 100 caratteri';
  }
  
  // Permette lettere, spazi, apostrofi e trattini
  if (!/^[a-zA-Zàèéìíîòóùú\s'-]+$/.test(trimmed)) {
    return 'Può contenere solo lettere, spazi, apostrofi e trattini';
  }
  
  return null; // Valido
}

/**
 * Valida un campo email
 * 
 * @param {string} value - Il valore da validare
 * @param {boolean} required - Se il campo è obbligatorio (default: false)
 * @returns {string|null} - Messaggio di errore se non valido, null se valido
 */
export function validateEmail(value, required = false) {
  if (!value || !value.trim()) {
    return required ? 'L\'email è obbligatoria' : null;
  }
  
  const trimmed = value.trim();
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return 'Formato email non valido (es. nome@dominio.com)';
  }
  
  if (trimmed.length > 255) {
    return 'L\'email non può superare i 255 caratteri';
  }
  
  return null; // Valido
}

/**
 * Valida una data di nascita
 * 
 * @param {string} value - La data in formato YYYY-MM-DD
 * @param {boolean} required - Se il campo è obbligatorio (default: false)
 * @returns {string|null} - Messaggio di errore se non valido, null se valido
 */
export function validateDateOfBirth(value, required = false) {
  if (!value) {
    return required ? 'La data di nascita è obbligatoria' : null;
  }
  
  const selectedDate = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Data minima: 1 gennaio 1900
  const minDate = new Date('1900-01-01');
  minDate.setHours(0, 0, 0, 0);
  
  if (selectedDate < minDate) {
    return 'La data di nascita non può essere prima del 1900';
  }
  
  if (selectedDate > today) {
    return 'La data di nascita non può essere nel futuro';
  }
  
  return null; // Valido
}

/**
 * Valida un campo specializzazione (per dottori)
 * 
 * @param {string} value - Il valore da validare
 * @param {boolean} required - Se il campo è obbligatorio (default: false)
 * @returns {string|null} - Messaggio di errore se non valido, null se valido
 */
export function validateSpecialization(value, required = false) {
  if (!value || !value.trim()) {
    return required ? 'La specializzazione è obbligatoria' : null;
  }
  
  if (value.trim().length > 150) {
    return 'La specializzazione non può superare i 150 caratteri';
  }
  
  return null; // Valido
}

/**
 * Valida un campo nome esame
 */
export function validateExamName(value) {
  if (!value || !value.trim()) {
    return 'Il nome dell\'esame è obbligatorio';
  }
  
  const trimmed = value.trim();
  
  if (trimmed.length < 3) {
    return 'Deve contenere almeno 3 caratteri';
  }
  
  if (trimmed.length > 100) {
    return 'Non può superare i 100 caratteri';
  }
  
  return null;
}

/**
 * Valida la durata di un esame
 */
export function validateExamDuration(value) {
  const duration = parseInt(value, 10);
  if (isNaN(duration) || duration <= 0) {
    return 'La durata deve essere un numero positivo';
  }
  if (duration > 480) {
    return 'La durata non può superare gli 480 minuti (8 ore)';
  }
  return null;
}

/**
 * Valida un campo in tempo reale
 * 
 * @param {string} fieldName - Nome del campo (firstName, lastName, email, ecc.)
 * @param {string} value - Valore del campo
 * @param {object} options - Opzioni di validazione (required, ecc.)
 * @returns {string|null} - Messaggio di errore se non valido, null se valido
 */
export function validateField(fieldName, value, options = {}) {
  switch (fieldName) {
    case 'firstName':
      return validateName(value, options.required !== false);
    
    case 'lastName':
      return validateName(value, options.required !== false);
    
    case 'email':
      return validateEmail(value, options.required === true);
    
    case 'dateOfBirth':
      return validateDateOfBirth(value, options.required === true);
    
    case 'specialization':
      return validateSpecialization(value, options.required === true);
    
    case 'phoneNumber':
      return validatePhoneNumber(value);
    
    case 'examName':
      return validateExamName(value);
    
    case 'durationMinutes':
      return validateExamDuration(value);
    
    default:
      return null;
  }
}

/**
 * Valida un intero form per paziente
 * 
 * @param {object} formData - Dati del form
 * @returns {object} - Oggetto con errori per ogni campo
 */
export function validatePatientForm(formData) {
  const errors = {};
  
  const firstNameError = validateName(formData.firstName, true);
  if (firstNameError) errors.firstName = firstNameError;
  
  const lastNameError = validateName(formData.lastName, true);
  if (lastNameError) errors.lastName = lastNameError;
  
  if (formData.email) {
    const emailError = validateEmail(formData.email, false);
    if (emailError) errors.email = emailError;
  }
  
  if (formData.dateOfBirth) {
    const dateError = validateDateOfBirth(formData.dateOfBirth, false);
    if (dateError) errors.dateOfBirth = dateError;
  }
  
  if (formData.phoneNumber) {
    const phoneError = validatePhoneNumber(formData.phoneNumber);
    if (phoneError) errors.phoneNumber = phoneError;
  }
  
  return errors;
}

/**
 * Valida un intero form per dottore
 * 
 * @param {object} formData - Dati del form
 * @returns {object} - Oggetto con errori per ogni campo
 */
export function validateDoctorForm(formData) {
  const errors = {};
  
  const firstNameError = validateName(formData.firstName, true);
  if (firstNameError) errors.firstName = firstNameError;
  
  const lastNameError = validateName(formData.lastName, true);
  if (lastNameError) errors.lastName = lastNameError;
  
  if (formData.specialization) {
    const specializationError = validateSpecialization(formData.specialization, false);
    if (specializationError) errors.specialization = specializationError;
  }
  
  if (formData.email) {
    const emailError = validateEmail(formData.email, false);
    if (emailError) errors.email = emailError;
  }
  
  if (formData.phoneNumber) {
    const phoneError = validatePhoneNumber(formData.phoneNumber);
    if (phoneError) errors.phoneNumber = phoneError;
  }
  
  return errors;
}
