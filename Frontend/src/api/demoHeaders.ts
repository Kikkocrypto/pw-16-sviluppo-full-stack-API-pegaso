
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

// Recupera gli ID demo dal localStorage
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

// Imposta l'ID demo per un tipo di utente specifico
export function setDemoId(type: DemoUserType, id: string | null): void {
  const storageKey = `demo${type.charAt(0).toUpperCase() + type.slice(1)}Id`;
  
  if (id) {
    // Rimuovi gli altri ruoli quando si imposta un nuovo ruolo
    if (type !== 'patient') {
      localStorage.removeItem('demoPatientId');
    }
    if (type !== 'doctor') {
      localStorage.removeItem('demoDoctorId');
    }
    if (type !== 'admin') {
      localStorage.removeItem('demoAdminId');
    }
    
    localStorage.setItem(storageKey, id);
    
    // Dispatches a custom event per notificare i componenti del cambiamento
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('demoRoleChanged', { detail: { type, id } }));
  } else {
    localStorage.removeItem(storageKey);
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('demoRoleChanged', { detail: { type, id: null } }));
  }
}

// Recupera l'ID demo per un tipo di utente specifico
export function getDemoId(type: DemoUserType): string | null {
  const storageKey = `demo${type.charAt(0).toUpperCase() + type.slice(1)}Id`;
  return localStorage.getItem(storageKey);
}

// Rimuove tutti gli header demo dal localStorage (logout)
export function clearDemoHeaders(): void {
  localStorage.removeItem('demoPatientId');
  localStorage.removeItem('demoDoctorId');
  localStorage.removeItem('demoAdminId');
  
  // Dispatches eventi per notificare i componenti del cambiamento
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new CustomEvent('demoRoleChanged', { detail: { type: null, id: null } }));
}

// Verifica se è presente almeno un header demo
export function hasDemoHeaders(): boolean {
  return !!(
    localStorage.getItem('demoPatientId') ||
    localStorage.getItem('demoDoctorId') ||
    localStorage.getItem('demoAdminId')
  );
}
