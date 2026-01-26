/**
 * Servizio API per la gestione dei pazienti
 * 
 * Gestisce tutte le chiamate API relative ai pazienti:
 * - Lista pazienti (per selettore demo)
 * - Creazione nuovo paziente
 */

import { apiGet, apiPost } from '../../apiClient';
import { API_ROUTES } from '../../routes';

/**
 * Interfaccia per i dati di un paziente
 */
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
}

/**
 * Interfaccia per la creazione di un paziente
 */
export interface CreatePatientData {
  firstName: string;
  lastName: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
}

/**
 * Recupera la lista dei pazienti (per selettore demo)
 * 
 * Nota: questa chiamata viene fatta SENZA header demo per ottenere la lista completa.
 * Il backend restituisce la lista quando non viene passato l'header X-Demo-Patient-Id.
 * Il limite viene applicato lato frontend dopo aver ricevuto tutti i risultati.
 * 
 * @param limit - Numero massimo di risultati da restituire (default: 10)
 * @returns Array di pazienti limitato
 */
export async function getPatients(limit: number = 10): Promise<Patient[]> {
  // skipDemoHeaders: true per ottenere la lista senza header demo
  const allPatients = await apiGet<Patient[]>(API_ROUTES.patients.list, {
    skipDemoHeaders: true,
  } as any);
  
  // Limita i risultati lato frontend
  return allPatients.slice(0, limit);
}

/**
 * Recupera il profilo del paziente corrente (basato sull'header X-Demo-Patient-Id)
 * @returns Profilo del paziente
 */
export async function getPatientProfile(): Promise<Patient> {
  return apiGet<Patient>(API_ROUTES.patients.current);
}

/**
 * Crea un nuovo paziente
 * @param data - Dati del paziente da creare
 * @returns Paziente creato con ID
 */
export async function createPatient(data: CreatePatientData): Promise<Patient> {
  return apiPost<Patient>(API_ROUTES.patients.create, data);
}
