/**
 * Utility per la gestione dei numeri di telefono
 * 
 * Gestisce il prefisso +39 e la formattazione dei numeri italiani
 */

/**
 * Normalizza un numero di telefono aggiungendo il prefisso +39 se necessario
 * 
 * @param {string} value - Il valore inserito dall'utente
 * @returns {string} - Numero normalizzato con prefisso +39
 */
export function normalizePhoneNumber(value) {
  if (!value) return '';
  
  // Rimuove tutto tranne numeri e +
  let cleaned = value.replace(/[^\d+]/g, '');
  
  // Se inizia con 39 (senza +), aggiungi +
  if (cleaned.startsWith('39') && !cleaned.startsWith('+39')) {
    cleaned = '+' + cleaned;
  }
  // Se inizia con un numero diverso da 39, aggiungi +39
  else if (cleaned && !cleaned.startsWith('+') && !cleaned.startsWith('39')) {
    cleaned = '+39' + cleaned;
  }
  // Se è vuoto o inizia già con +39, lascia così
  else if (!cleaned.startsWith('+39') && cleaned.length > 0) {
    cleaned = '+39' + cleaned.replace(/^\+?/, '');
  }
  
  // Limita la lunghezza totale (max 20 caratteri incluso +39)
  if (cleaned.length > 20) {
    cleaned = cleaned.substring(0, 20);
  }
  
  return cleaned;
}

/**
 * Valida un numero di telefono italiano
 * 
 * @param {string} value - Il numero di telefono da validare
 * @returns {string|null} - Messaggio di errore se non valido, null se valido
 */
export function validatePhoneNumber(value) {
  if (!value || !value.trim()) {
    return null; // Campo opzionale
  }
  
  // Rimuove spazi e caratteri non numerici (tranne +)
  const cleaned = value.replace(/[^\d+]/g, '');
  
  if (cleaned && !cleaned.startsWith('+39')) {
    return 'Il numero deve iniziare con +39';
  }
  
  if (cleaned && cleaned.length < 13) {
    return 'Il numero deve contenere almeno 13 caratteri (+39 seguito da 10 cifre)';
  }
  
  if (cleaned && cleaned.length > 20) {
    return 'Il numero non può superare i 20 caratteri';
  }
  
  return null; // Valido
}

/**
 * Assicura che un numero di telefono abbia il prefisso +39
 * Utile prima di inviare i dati al backend
 * 
 * @param {string} phoneNumber - Numero di telefono
 * @returns {string|null} - Numero con prefisso +39 o null se vuoto
 */
export function ensurePhonePrefix(phoneNumber) {
  if (!phoneNumber || !phoneNumber.trim()) {
    return null;
  }
  
  const trimmed = phoneNumber.trim();
  if (trimmed.startsWith('+39')) {
    return trimmed;
  }
  
  // Aggiungi +39 se mancante
  const cleaned = trimmed.replace(/^\+?/, '');
  return '+39' + cleaned;
}
