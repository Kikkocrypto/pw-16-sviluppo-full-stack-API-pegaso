/**
 * Utility per estrarre messaggi di errore da vari formati
 */

/**
 * Messaggi generici per prevenire account enumeration
 */
const GENERIC_ERROR_MESSAGES = {
  409: 'Impossibile completare l\'operazione. Verifica i dati inseriti e riprova.',
  401: 'Credenziali non valide.',
  403: 'Accesso negato.',
  404: 'Risorsa non trovata.',
};

/**
 * Verifica se un errore è di tipo sensibile (che potrebbe rivelare informazioni)
 * 
 * @param {any} error - L'oggetto errore
 * @returns {boolean} - True se l'errore è sensibile
 */
function isSensitiveError(error) {
  // Errori 409 (Conflict) possono rivelare se un account esiste
  if (error.statusCode === 409 || error.status === 409) {
    return true;
  }
  
  // Errori 401 (Unauthorized) possono rivelare se un account esiste
  if (error.statusCode === 401 || error.status === 401) {
    return true;
  }
  
  // Controlla anche in error.response
  if (error.response?.status === 409 || error.response?.status === 401) {
    return true;
  }
  
  return false;
}

/**
 * Estrae il messaggio di errore da un oggetto errore
 * 
 * @param {any} error - L'oggetto errore
 * @param {string} defaultMessage - Messaggio di default se non trovato
 * @returns {string} - Il messaggio di errore
 */
export function getErrorMessage(error, defaultMessage = 'Si è verificato un errore') {
  // Prevenzione account enumeration: per errori sensibili, usa messaggi generici
  if (isSensitiveError(error)) {
    const status = error.statusCode || error.status || error.response?.status;
    if (status && GENERIC_ERROR_MESSAGES[status]) {
      return GENERIC_ERROR_MESSAGES[status];
    }
  }
  // Se è già una stringa, restituiscila
  if (typeof error === 'string') {
    return error || defaultMessage;
  }

  // Se è null o undefined
  if (!error) {
    return defaultMessage;
  }

  // ApiClientError (ha message)
  if (error.message && typeof error.message === 'string') {
    return error.message;
  }

  // AxiosError - controlla error.response.data
  if (error.response) {
    const data = error.response.data;
    
    // Formato standardizzato del backend: { error: { message: ... } }
    if (data?.error?.message) {
      return data.error.message;
    }
    
    // Messaggio diretto in data
    if (data?.message) {
      return data.message;
    }
    
    // Se data è una stringa
    if (typeof data === 'string') {
      return data;
    }
  }

  // Error standard
  if (error.message) {
    return error.message;
  }

  // Prova a estrarre da vari campi comuni
  if (error.error?.message) {
    return error.error.message;
  }

  if (error.details) {
    return error.details;
  }

  // Se è un oggetto, prova a stringificarlo (per debug)
  if (typeof error === 'object') {
    try {
      const stringified = JSON.stringify(error);
      if (stringified !== '{}') {
        return `Errore: ${stringified}`;
      }
    } catch (e) {
      // Ignora errori di stringificazione
    }
  }

  return defaultMessage;
}
