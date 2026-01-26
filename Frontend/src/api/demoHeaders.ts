
// Definizione degli header letti dal local storage e aggiunti automaticamente all'header delle chiamate (apiClient.js, dove serve)

export const DEMO_HEADERS = {
  PATIENT: 'X-Demo-Patient-Id',
  DOCTOR: 'X-Demo-Doctor-Id',
  ADMIN: 'X-Demo-Admin-Id',
} as const;

export type DemoUserType = 'patient' | 'doctor' | 'admin';

export interface DemoHeaders {
  'X-Demo-Patient-Id'?: string;
  'X-Demo-Doctor-Id'?: string;
  'X-Demo-Admin-Id'?: string;
}

/**
 * Recupera gli ID demo dal localStorage
 * @returns Oggetto con gli header demo se presenti
 */
export function getDemoHeaders(): DemoHeaders {
  const headers: DemoHeaders = {};

  const patientId = localStorage.getItem('demoPatientId');
  const doctorId = localStorage.getItem('demoDoctorId');
  const adminId = localStorage.getItem('demoAdminId');

  if (patientId) {
    headers['X-Demo-Patient-Id'] = patientId;
  }
  if (doctorId) {
    headers['X-Demo-Doctor-Id'] = doctorId;
  }
  if (adminId) {
    headers['X-Demo-Admin-Id'] = adminId;
  }

  return headers;
}

/**
 * Imposta l'ID demo per un tipo di utente specifico
 * @param type - Tipo di utente ('patient', 'doctor', 'admin')
 * @param id - UUID dell'utente (null per rimuovere)
 */
export function setDemoId(type: DemoUserType, id: string | null): void {
  const storageKey = `demo${type.charAt(0).toUpperCase() + type.slice(1)}Id`;
  
  if (id) {
    localStorage.setItem(storageKey, id);
  } else {
    localStorage.removeItem(storageKey);
  }
}

/**
 * Recupera l'ID demo per un tipo di utente specifico
 * @param type - Tipo di utente ('patient', 'doctor', 'admin')
 * @returns UUID dell'utente o null se non presente
 */
export function getDemoId(type: DemoUserType): string | null {
  const storageKey = `demo${type.charAt(0).toUpperCase() + type.slice(1)}Id`;
  return localStorage.getItem(storageKey);
}

/**
 * Rimuove tutti gli header demo dal localStorage (logout)
 */
export function clearDemoHeaders(): void {
  localStorage.removeItem('demoPatientId');
  localStorage.removeItem('demoDoctorId');
  localStorage.removeItem('demoAdminId');
}

/**
 * Verifica se è presente almeno un header demo
 * @returns true se almeno un ID demo è presente
 */
export function hasDemoHeaders(): boolean {
  return !!(
    localStorage.getItem('demoPatientId') ||
    localStorage.getItem('demoDoctorId') ||
    localStorage.getItem('demoAdminId')
  );
}
