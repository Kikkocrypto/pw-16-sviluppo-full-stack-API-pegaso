// DEFINIZIONE DELLE ROUTE API DEL BACKEND, tutte partono dalla baseURL configurata in apiClient

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
    create: '/admin/exams', // Corretto: AdminController @RequestMapping("/api/admin") + @PostMapping("/exams")
    update: (id: string) => `/admin/exams/${id}`, // Corretto: AdminController @PatchMapping("/exams/{examId}")
    delete: (id: string) => `/admin/exams/${id}`, // Corretto: AdminController @DeleteMapping("/exams/{examId}")
    assignDoctor: (examId: string, doctorId: string) => `/admin/exams/${examId}/doctors/${doctorId}`,
    removeDoctor: (examId: string, doctorId: string) => `/admin/exams/${examId}/doctors/${doctorId}`,
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

// Helper per costruire query string per le chiamate API
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

