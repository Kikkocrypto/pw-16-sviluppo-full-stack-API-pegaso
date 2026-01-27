import { apiGet, apiPost, apiPatch } from '../../apiClient';
import { API_ROUTES, buildQueryString } from '../../routes';


// Modello di Appointment per la lista degli appuntamenti
export interface Appointment {
  id: string;
  patientId: string;
  patientFirstName?: string;
  patientLastName?: string;
  doctorId: string;
  doctorFirstName?: string;
  doctorLastName?: string;
  examId: string;
  examName?: string;
  appointmentDate: string;
  durationMinutes: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  reason?: string;
  contraindications?: string;
}

export interface CreateAppointmentRequest {
  doctorId: string;
  examId: string;
  appointmentDate: string;
  notes?: string;
  contraindications?: string;
}

export interface AppointmentFilters {
  status?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

/**
 * Recupera la lista degli appuntamenti (filtra automaticamente in base al ruolo/header)
 */
export async function getAppointments(filters: AppointmentFilters = {}): Promise<Appointment[]> {
  const queryString = buildQueryString(filters as any);
  return apiGet<Appointment[]>(`${API_ROUTES.appointments.list}${queryString}`);
}

/**
 * Recupera i dettagli di un singolo appuntamento
 */
export async function getAppointmentDetail(id: string): Promise<Appointment> {
  return apiGet<Appointment>(API_ROUTES.appointments.detail(id));
}

/**
 * Crea un nuovo appuntamento (richiede header X-Demo-Patient-Id)
 */
export async function createAppointment(data: CreateAppointmentRequest): Promise<Appointment> {
  return apiPost<Appointment>(API_ROUTES.appointments.create, data);
}

/**
 * Annulla un appuntamento (richiede header X-Demo-Patient-Id)
 */
export async function cancelAppointment(id: string): Promise<Appointment> {
  return apiPatch<Appointment>(API_ROUTES.appointments.cancel(id));
}
