/**
 * Definizione delle route API del backend
 * 
 * Tutte le route sono relative al baseURL configurato in apiClient
 * (es. se baseURL = 'http://localhost:8080/api', allora '/patients' diventa 'http://localhost:8080/api/patients')
 */

export const API_ROUTES = {
  // Health check
  health: '/health',

  // Patients
  patients: {
    list: '/patients',
    detail: (id: string) => `/patients/${id}`,
    current: '/patients', // Con header X-Demo-Patient-Id
    create: '/patients',
    update: '/patients', // Con header X-Demo-Patient-Id
    delete: '/patients', // Con header X-Demo-Patient-Id
    deleteById: (id: string) => `/patients/${id}`, // Admin
    appointments: (id: string) => `/patients/${id}/appointments`,
  },

  // Doctors
  doctors: {
    list: '/doctors',
    detail: (id: string) => `/doctors/${id}`, // Admin
    current: '/doctors', // Con header X-Demo-Doctor-Id
    create: '/doctors',
    update: '/doctors', // Con header X-Demo-Doctor-Id
    delete: '/doctors', // Con header X-Demo-Doctor-Id
    deleteById: (id: string) => `/doctors/${id}`, // Admin
    appointments: (id: string) => `/doctors/${id}/appointments`,
    exams: (id: string) => `/doctors/${id}/exams`,
  },

  // Exams
  exams: {
    list: '/exams',
    detail: (id: string) => `/exams/${id}`,
    create: '/exams', // Con header X-Demo-Admin-Id
    update: (id: string) => `/exams/${id}`, // Con header X-Demo-Admin-Id
    delete: (id: string) => `/exams/${id}`, // Con header X-Demo-Admin-Id
  },

  // Appointments
  appointments: {
    list: '/appointments', // con tutti gli headers
    detail: (id: string) => `/appointments/${id}`, // con tutti gli headers
    create: '/appointments', // Con header X-Demo-Patient-Id (paziente) o senza header (admin)
    update: (id: string) => `/appointments/${id}`, // Con header X-Demo-Doctor-Id (dottore) o senza header (admin)
    delete: (id: string) => `/appointments/${id}`, // Admin, Doctor, Patient (per cancellazione)
  },
} as const;

/**
 * Helper per costruire query string per le chiamate API
 */
export function buildQueryString(params: Record<string, string | number | boolean | null | undefined>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Esempi di utilizzo:
 * 
 * // Health check
 * api.get(API_ROUTES.health)
 * 
 * // Lista pazienti
 * api.get(API_ROUTES.patients.list)
 * api.get(API_ROUTES.patients.list + buildQueryString({ limit: 20 }))
 * 
 * // Dettaglio paziente
 * api.get(API_ROUTES.patients.detail('550e8400-e29b-41d4-a716-446655440000'))
 * 
 * // Profilo paziente corrente (con header X-Demo-Patient-Id)
 * api.get(API_ROUTES.patients.current)
 * 
 * // Creazione paziente
 * api.post(API_ROUTES.patients.create, { firstName: 'Mario', lastName: 'Rossi' })
 * 
 * // Lista prenotazioni paziente
 * api.get(API_ROUTES.patients.appointments('550e8400-e29b-41d4-a716-446655440000'))
 * 
 * // Lista prenotazioni con filtri
 * api.get(API_ROUTES.appointments.list + buildQueryString({ 
 *   status: 'pending', 
 *   from: '2026-02-01T00:00:00Z',
 *   limit: 20 
 * }))
 * 
 * // Creazione prenotazione (con header X-Demo-Patient-Id)
 * api.post(API_ROUTES.appointments.create, {
 *   doctorId: '...',
 *   examId: '...',
 *   scheduledAt: '2026-02-15T10:00:00Z'
 * })
 * 
 * // Annullamento prenotazione (con header X-Demo-Patient-Id)
 * api.patch(API_ROUTES.appointments.cancel('880e8400-e29b-41d4-a716-446655440003'))
 */
