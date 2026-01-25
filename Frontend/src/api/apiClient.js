/**
 * API Client per comunicare con il backend Spring Boot
 * 
 * Utilizza la variabile d'ambiente VITE_API_BASE_URL per determinare
 * l'URL base del backend.
 */


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

/**
 * Esegue una richiesta HTTP al backend
 * 
 * @param {string} endpoint - Endpoint relativo (es: '/patients')
 * @param {object} options - Opzioni fetch standard + headers personalizzati
 * @returns {Promise<Response>}
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Headers di default
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Recupera gli header demo dal localStorage se presenti
  const demoPatientId = localStorage.getItem('demoPatientId');
  const demoDoctorId = localStorage.getItem('demoDoctorId');
  const demoAdminId = localStorage.getItem('demoAdminId');

  // Aggiungi header demo se presenti
  if (demoPatientId) {
    defaultHeaders['X-Demo-Patient-Id'] = demoPatientId;
  }
  if (demoDoctorId) {
    defaultHeaders['X-Demo-Doctor-Id'] = demoDoctorId;
  }
  if (demoAdminId) {
    defaultHeaders['X-Demo-Admin-Id'] = demoAdminId;
  }

  // Merge con gli header forniti nelle options
  const headers = {
    ...defaultHeaders,
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };
  //try catch per gestire errori di connessione
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}

/**
 * Helper functions per i vari metodi HTTP
 */
export const api = {
  get: (endpoint, options) => apiRequest(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, data, options) => apiRequest(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  }),
  patch: (endpoint, data, options) => apiRequest(endpoint, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (endpoint, options) => apiRequest(endpoint, { ...options, method: 'DELETE' }),
};
