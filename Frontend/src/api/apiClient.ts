/**
 * API Client per comunicare con il backend Spring Boot
 * 
 * Utilizza Axios per le richieste HTTP con:
 * - baseURL configurato dalla variabile d'ambiente VITE_API_BASE_URL
 * - Gestione automatica degli header demo
 * - Gestione errori centralizzata
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { getDemoHeaders } from './demoHeaders';

// Base URL del backend
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8080/api';


export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: string;
  };
}

/**
 * Classe personalizzata per errori API
 */
export class ApiClientError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
    public details?: string
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

/**
 * Crea e configura l'istanza Axios
 */
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    timeout: 30000,
  });

  // Interceptor per aggiungere automaticamente gli header demo
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const demoHeaders = getDemoHeaders();
      
      // Aggiungi gli header demo se presenti
      if (demoHeaders['X-Demo-Patient-Id']) {
        config.headers['X-Demo-Patient-Id'] = demoHeaders['X-Demo-Patient-Id'];
      }
      if (demoHeaders['X-Demo-Doctor-Id']) {
        config.headers['X-Demo-Doctor-Id'] = demoHeaders['X-Demo-Doctor-Id'];
      }
      if (demoHeaders['X-Demo-Admin-Id']) {
        config.headers['X-Demo-Admin-Id'] = demoHeaders['X-Demo-Admin-Id'];
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Interceptor per gestire gli errori in modo centralizzato
  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error: AxiosError<ApiError>) => {
      return handleApiError(error);
    }
  );

  return instance;
};

// Gestione degli errori API
const handleApiError = (error: AxiosError<ApiError>): Promise<never> => {
  // Errore di rete o timeout
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      throw new ApiClientError(
        'Timeout: la richiesta ha impiegato troppo tempo. Riprova più tardi.',
        undefined,
        'TIMEOUT'
      );
    }
    if (error.request) {
      throw new ApiClientError(
        'Impossibile connettersi al server. Verifica la connessione di rete.',
        undefined,
        'NETWORK_ERROR'
      );
    }
    throw new ApiClientError(
      'Errore sconosciuto durante la richiesta.',
      undefined,
      'UNKNOWN_ERROR'
    );
  }

  // Errore con risposta dal server
  const { status, data } = error.response;

  // Se il backend restituisce un formato di errore standardizzato
  if (data?.error) {
    const apiError = data.error;
    throw new ApiClientError(
      apiError.message || `Errore ${status}`,
      status,
      apiError.code,
      apiError.details
    );
  }

  // Errore senza formato standardizzato
  const statusMessages: Record<number, string> = {
    400: 'Richiesta non valida. Verifica i dati inseriti.',
    401: 'Non autorizzato. Effettua il login.',
    403: 'Accesso negato. Non hai i permessi necessari.',
    404: 'Risorsa non trovata.',
    409: 'Conflitto. La risorsa potrebbe essere già esistente o in uso.',
    500: 'Errore interno del server. Riprova più tardi.',
    502: 'Errore del gateway. Il server non è disponibile.',
    503: 'Servizio non disponibile. Riprova più tardi.',
  };

  throw new ApiClientError(
    statusMessages[status] || `Errore ${status}: ${error.message}`,
    status,
    `HTTP_${status}`
  );
};

// Istanza Axios configurata
const apiClient = createAxiosInstance();

/**
 * Helper per le richieste GET
 */
export const apiGet = async <T = any>(
  endpoint: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await apiClient.get<T>(endpoint, config);
  return response.data;
};

/**
 * Helper per le richieste POST
 */
export const apiPost = async <T = any>(
  endpoint: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await apiClient.post<T>(endpoint, data, config);
  return response.data;
};

/**
 * Helper per le richieste PATCH
 */
export const apiPatch = async <T = any>(
  endpoint: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await apiClient.patch<T>(endpoint, data, config);
  return response.data;
};

/**
 * Helper per le richieste DELETE
 */
export const apiDelete = async <T = any>(
  endpoint: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await apiClient.delete<T>(endpoint, config);
  return response.data;
};

/**
 * Oggetto API con metodi helper (compatibilità con il vecchio codice)
 */
export const api = {
  get: apiGet,
  post: apiPost,
  patch: apiPatch,
  delete: apiDelete,
};

/**
 * Esporta anche l'istanza Axios per casi avanzati
 */
export { apiClient };

/**
 * Esporta il baseURL per riferimento
 */
export { API_BASE_URL };
