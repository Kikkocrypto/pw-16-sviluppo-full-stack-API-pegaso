import { api } from '../../apiClient';
import { API_ROUTES, buildQueryString } from '../../routes';


// Modello di Appointment per la lista degli appuntamenti
export interface Appointment {
  id: string;
  patientId: string;
  patientFirstName?: string;
  patientLastName?: string;
  patientEmail?: string;
  doctorId: string;
  doctorFirstName?: string;
  doctorLastName?: string;
  doctorGender?: string;
  examId: string;
  examName?: string;
  appointmentDate: string;
  durationMinutes: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  reason?: string;
  contraindications?: string;
}

export interface CreateAppointmentRequest {
  doctorId: string;
  examId: string;
  appointmentDate: string;
  reason?: string;
  contraindications?: string;
}

export interface AppointmentFilters {
  status?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export interface UpdateAppointmentRequest {
  appointmentDate?: string;
  reason?: string;
  contraindications?: string;
  status?: string;
}

/**
 * Recupera la lista degli appuntamenti (filtra automaticamente in base al ruolo/header)
 */
export async function getAppointments(filters: AppointmentFilters = {}): Promise<Appointment[]> {
  const queryString = buildQueryString(filters as any);
  return api.get<Appointment[]>(`${API_ROUTES.appointments.list}${queryString}`);
}

/**
 * Recupera i dettagli di un singolo appuntamento
 */
export async function getAppointmentDetail(id: string): Promise<Appointment> {
  return api.get<Appointment>(API_ROUTES.appointments.detail(id));
}

/**
 * Crea un nuovo appuntamento (richiede header X-Demo-Patient-Id)
 */
export async function createAppointment(data: CreateAppointmentRequest): Promise<Appointment> {
  return api.post<Appointment>(API_ROUTES.appointments.create, data);
}

/**
 * Aggiorna un appuntamento
 */
export async function updateAppointment(id: string, data: UpdateAppointmentRequest): Promise<Appointment> {
  return api.patch<Appointment>(API_ROUTES.appointments.update(id), data);
}

/**
 * Annulla un appuntamento (richiede header X-Demo-Patient-Id o X-Demo-Doctor-Id o X-Demo-Admin-Id)
 * Il backend esegue un "soft delete" impostando lo stato a "cancelled"
 */
export async function cancelAppointment(id: string): Promise<void> {
  return api.delete(API_ROUTES.appointments.delete(id));
}
