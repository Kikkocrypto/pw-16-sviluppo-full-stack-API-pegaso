/**
 * Servizio API per la gestione dei dottori
 * 
 * Gestisce tutte le chiamate API relative ai dottori:
 * - Lista dottori (per selettore demo)
 * - Creazione nuovo dottore
 */

import { apiGet, apiPost, apiPatch, apiDelete } from '../../apiClient';
import { API_ROUTES } from '../../routes';

/**
 * Interfaccia per i dati di un dottore
 */
export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialization?: string | null;
  gender?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  exams?: {
    examId: string;
    examName: string;
    description?: string;
  }[];
}

/**
 * Interfaccia per la creazione di un dottore
 */
export interface CreateDoctorData {
  firstName: string;
  lastName: string;
  specialization?: string | null;
  gender?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  examIds?: string[] | null;
}

/**
 * Recupera la lista dei dottori (per selettore demo)
 * 
 * Nota: questa chiamata viene fatta SENZA header demo per ottenere la lista completa.
 * Il backend restituisce la lista quando non viene passato l'header X-Demo-Doctor-Id.
 * Il limite viene applicato lato frontend dopo aver ricevuto tutti i risultati.
 * 
 * @param limit - Numero massimo di risultati da restituire (default: 10)
 * @returns Array di dottori limitato
 */
export async function getDoctors(limit: number = 10): Promise<Doctor[]> {
  // skipDemoHeaders: true per ottenere la lista senza header demo
  const allDoctors = await apiGet<Doctor[]>(API_ROUTES.doctors.list, {
    skipDemoHeaders: true,
  } as any);
  
  // Limita i risultati lato frontend
  return allDoctors.slice(0, limit);
}

/**
 * Recupera il profilo del dottore corrente (basato sull'header X-Demo-Doctor-Id)
 * @returns Profilo del dottore
 */
export async function getDoctorProfile(): Promise<Doctor> {
  return apiGet<Doctor>(API_ROUTES.doctors.current);
}

/**
 * Recupera la lista dei dottori abilitati per un determinato esame
 * Se viene fornita una data, filtra anche per disponibilità
 * @param examId - ID dell'esame
 * @param date - Data e ora dell'appuntamento (opzionale)
 * @returns Array di dottori
 */
export async function getDoctorsByExam(examId: string, date?: string): Promise<Doctor[]> {
  let url = `${API_ROUTES.doctors.list}?examId=${examId}`;
  if (date) {
    url += `&date=${encodeURIComponent(date)}`;
  }
  return apiGet<Doctor[]>(url);
}

/**
 * Crea un nuovo dottore
 * @param data - Dati del dottore da creare
 * @returns Dottore creato con ID
 */
export async function createDoctor(data: CreateDoctorData): Promise<Doctor> {
  return apiPost<Doctor>(API_ROUTES.doctors.create, data);
}

/**
 * Aggiorna il profilo del dottore corrente (basato sull'header X-Demo-Doctor-Id)
 * @param data - Dati da aggiornare
 * @returns Profilo aggiornato
 */
export async function updateDoctorProfile(data: Partial<CreateDoctorData>): Promise<Doctor> {
  return apiPatch<Doctor>(API_ROUTES.doctors.update, data);
}

/**
 * Elimina il profilo del dottore corrente (basato sull'header X-Demo-Doctor-Id)
 */
export async function deleteDoctorProfile(): Promise<void> {
  return apiDelete<void>(API_ROUTES.doctors.delete);
}
