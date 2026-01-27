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
export function getErrorMessage(error, defaultMessage = 'Si è verificato un errore', bypassSensitivity = false) {
  // Se è già una stringa, restituiscila
  if (typeof error === 'string') {
    return error || defaultMessage;
  }

  // Se è null o undefined
  if (!error) {
    return defaultMessage;
  }

  // 1. Priorità assoluta ai dati strutturati della risposta
  // Se è un ApiClientError, il messaggio è già stato estratto dal JSON nel client
  if (error.name === 'ApiClientError' || error.statusCode) {
    const status = error.statusCode || error.response?.status;
    
    // Se non vogliamo bypassare la sensibilità (es. login), usiamo il messaggio generico
    if (!bypassSensitivity && isSensitiveError(error)) {
      if (status && GENERIC_ERROR_MESSAGES[status]) {
        return GENERIC_ERROR_MESSAGES[status];
      }
    }
    
    // Se abbiamo un messaggio specifico (estratto dal backend), usiamolo
    if (error.message && 
        !error.message.toLowerCase().includes('status code') && 
        error.message.toLowerCase() !== 'error 409' &&
        error.message.toLowerCase() !== 'conflict') {
      return error.message;
    }
  }

  const responseData = error.response?.data || error.data;
  if (responseData) {
    // Formato standard: { message: ... }
    if (responseData.message) {
      const msg = responseData.message;
      if (!bypassSensitivity && isSensitiveError(error)) {
        const status = error.response?.status || error.status;
        return GENERIC_ERROR_MESSAGES[status] || msg;
      }
      return msg;
    }
    
    // Formato: { error: { message: ... } }
    if (responseData.error?.message) {
      const msg = responseData.error.message;
      if (!bypassSensitivity && isSensitiveError(error)) {
        const status = error.response?.status || error.status;
        return GENERIC_ERROR_MESSAGES[status] || msg;
      }
      return msg;
    }
    
    // Se data è una stringa diretta
    if (typeof responseData === 'string' && responseData.length > 0 && !responseData.includes('<!DOCTYPE')) {
      return responseData;
    }
  }

  // 2. Fallback su error.message standard
  if (error.message && typeof error.message === 'string') {
    if (error.message.toLowerCase().includes('status code') || error.message.toLowerCase() === 'error 409') {
      return defaultMessage;
    }
    return error.message;
  }

  return defaultMessage;
}
