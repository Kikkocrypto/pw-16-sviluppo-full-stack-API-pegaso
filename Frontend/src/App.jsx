import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/shared/HomePage';
import PatientAccessPage from './pages/patient/PatientAccessPage';
import PatientDashboardPage from './pages/patient/PatientDashboardPage';
import BookAppointmentPage from './pages/patient/BookAppointmentPage';
import PatientProfilePage from './pages/patient/PatientProfilePage';
import PatientAppointmentsPage from './pages/patient/PatientAppointmentsPage';
import DoctorAccessPage from './pages/doctor/DoctorAccessPage';
import DoctorDashboardPage from './pages/doctor/DoctorDashboardPage';
import AppointmentManagePage from './pages/doctor/AppointmentManagePage';
import AppointmentDetailPage from './pages/shared/AppointmentDetailPage';
import ExamListPage from './pages/shared/ExamListPage';
import ExamDetailPage from './pages/shared/ExamDetailPage';
import AdminPage from './pages/admin/AdminPage';
import AdminPatientsPage from './pages/admin/AdminPatientsPage';
import AdminDoctorsPage from './pages/admin/AdminDoctorsPage';
import AdminAppointmentsPage from './pages/admin/AdminAppointmentsPage';
import AdminExamsPage from './pages/admin/AdminExamsPage';
import Header from './components/shared/Header';
import { ToastProvider } from './contexts/ToastContext';
import './App.css';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <div className="app">
          <Header />
          <main className="app-main">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/home" element={<HomePage />} />
              
              <Route path="/patient" element={<PatientAccessPage />} />
              <Route path="/patient/dashboard" element={<PatientDashboardPage />} />
              <Route path="/patient/book" element={<BookAppointmentPage />} />
              <Route path="/patient/profile" element={<PatientProfilePage />} />
              <Route path="/patient/appointments" element={<PatientAppointmentsPage />} />
              <Route path="/patient/appointments/:id" element={<AppointmentDetailPage />} />
              
              <Route path="/doctor" element={<DoctorAccessPage />} />
              <Route path="/doctor/dashboard" element={<DoctorDashboardPage />} />
              <Route path="/doctor/appointments/:id" element={<AppointmentManagePage />} />
              
              <Route path="/appointments/:id" element={<AppointmentDetailPage />} />
              
              <Route path="/exams" element={<ExamListPage />} />
              <Route path="/exams/:id" element={<ExamDetailPage />} />
              
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/patients" element={<AdminPatientsPage />} />
              <Route path="/admin/doctors" element={<AdminDoctorsPage />} />
              <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
              <Route path="/admin/exams" element={<AdminExamsPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
