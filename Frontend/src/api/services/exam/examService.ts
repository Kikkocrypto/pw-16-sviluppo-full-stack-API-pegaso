import { apiGet, apiPost, apiPatch, apiDelete } from '../../apiClient';
import { API_ROUTES } from '../../routes';

export interface Exam {
  id: string;
  name: string;
  description?: string;
  durationMinutes: number;
  isActive: boolean;
}

export interface CreateExamRequest {
  name: string;
  description?: string;
  durationMinutes: number;
}

export interface UpdateExamRequest {
  name?: string;
  description?: string;
  durationMinutes?: number;
  isActive?: boolean;
}

/**
 * Recupera la lista di tutti gli esami
 * @param active - Filtra solo gli esami attivi (opzionale)
 */
export async function getExams(active?: boolean): Promise<Exam[]> {
  const url = active !== undefined ? `${API_ROUTES.exams.list}?active=${active}` : API_ROUTES.exams.list;
  return apiGet<Exam[]>(url);
}

/**
 * Recupera i dettagli di un singolo esame
 */
export async function getExamDetail(id: string): Promise<Exam> {
  return apiGet<Exam>(API_ROUTES.exams.detail(id));
}

/**
 * Crea un nuovo esame (Admin)
 */
export async function createExam(data: CreateExamRequest): Promise<Exam> {
  return apiPost<Exam>(API_ROUTES.exams.create, data);
}

/**
 * Aggiorna un esame esistente (Admin)
 */
export async function updateExam(id: string, data: UpdateExamRequest): Promise<Exam> {
  return apiPatch<Exam>(API_ROUTES.exams.update(id), data);
}

/**
 * Elimina un esame (Admin)
 */
export async function deleteExam(id: string): Promise<void> {
  return apiDelete<void>(API_ROUTES.exams.delete(id));
}

/**
 * Assegna un dottore a un esame (Admin)
 */
export async function assignDoctorToExam(examId: string, doctorId: string): Promise<void> {
  return apiPost<void>(API_ROUTES.exams.assignDoctor(examId, doctorId));
}

/**
 * Rimuove un dottore da un esame (Admin)
 */
export async function removeDoctorFromExam(examId: string, doctorId: string): Promise<void> {
  return apiDelete<void>(API_ROUTES.exams.removeDoctor(examId, doctorId));
}
