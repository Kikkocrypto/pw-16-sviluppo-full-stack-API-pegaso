import { apiGet, apiPost } from '../../apiClient';
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

/**
 * Recupera la lista di tutti gli esami attivi
 */
export async function getExams(): Promise<Exam[]> {
  return apiGet<Exam[]>(API_ROUTES.exams.list);
}

/**
 * Recupera i dettagli di un singolo esame
 */
export async function getExamDetail(id: string): Promise<Exam> {
  return apiGet<Exam>(API_ROUTES.exams.detail(id));
}
