import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPatientProfile } from '../../api/services/patient/patientService';
import { getAppointments } from '../../api/services/appointments/appointmentService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { IconCalendar, IconClock, IconDoctor, IconPlus, IconUser, IconList } from '../../components/common/Icons';
import './PatientDashboardPage.css';

function PatientDashboardPage() {
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Carica i dati della dashboard
  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileData, appointmentsData] = await Promise.all([
        getPatientProfile(),
        getAppointments({ limit: 5 })
      ]);
      console.log('Dashboard data loaded:', { profileData, appointmentsData });
      setPatient(profileData);
      setAppointments(appointmentsData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Impossibile caricare i dati della dashboard. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Caricamento dashboard..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadDashboardData} />;
  }

  // Filtra i appuntamenti per mostrare solo quelli non cancellati
  const upcomingAppointments = appointments.filter(app => app && app.status !== 'cancelled');
  const formatDate = (dateValue) => {
    if (!dateValue) return { day: '?', month: '?', time: '?', full: 'Data non disponibile' };
    
    let date;
    if (Array.isArray(dateValue)) {
      const [year, month, day, hour, minute] = dateValue;
      // Il backend invia UTC, creiamo la data come UTC
      date = new Date(Date.UTC(year, month - 1, day, hour || 0, minute || 0));
    } else {
      // Se è una stringa ISO (es. "2026-02-15T10:00:00"), aggiungiamo 'Z' se manca 
      // per forzare il parsing come UTC
      const normalizedDate = typeof dateValue === 'string' && !dateValue.endsWith('Z') && !dateValue.includes('+')
        ? `${dateValue}Z`
        : dateValue;
      date = new Date(normalizedDate);
    }

    if (isNaN(date.getTime())) {
      console.error('Invalid date received:', dateValue);
      return { day: '?', month: '?', time: '?', full: 'Data non valida' };
    }

    return {
      day: String(date.getDate()),
      month: date.toLocaleString('it-IT', { month: 'short' }),
      time: date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      full: date.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
    };
  };

  return (
    <div className="patient-dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Ciao, {patient?.firstName}!</h1>
          <p className="welcome-text">
            {patient?.gender === 'F' ? 'Bentornata' : 'Bentornato'} nel tuo portale salute.
          </p>
        </div>
        <Link to="/patient/book" className="btn btn-primary">
          Prenota Visita
        </Link>
      </header>

      <div className="dashboard-grid">
        <div className="dashboard-main">
          <section className="dashboard-section">
            <div className="section-header">
              <h2>I tuoi prossimi appuntamenti</h2>
              <Link to="/patient/appointments" className="home-link" style={{ color: '#007bff' }}>
                Vedi tutti
              </Link>
            </div>

            {upcomingAppointments.length > 0 ? (
              <div className="appointments-list">
                {upcomingAppointments.map(app => {
                  const date = formatDate(app.appointmentDate);
                  const getDoctorTitle = (gender) => {
                    if (gender === 'F') return 'Dott.ssa';
                    if (gender === 'M') return 'Dott.';
                    return 'Dott.'; // Fallback
                  };
                  const doctorName = app.doctorFirstName && app.doctorLastName 
                    ? `${getDoctorTitle(app.doctorGender)} ${app.doctorFirstName} ${app.doctorLastName}`
                    : 'Dottore';
                  
                  return (
                    <div key={app.id} className="appointment-card">
                      <div className="appointment-main">
                        <div className="appointment-date">
                          <span className="date-day">{date.day}</span>
                          <span className="date-month">{date.month}</span>
                        </div>
                        <div className="appointment-details">
                          <h3>{app.examName || 'Esame medico'}</h3>
                          <div className="appointment-meta">
                            <span><IconClock size={14} /> {date.time}</span>
                            <span><IconDoctor size={14} /> {doctorName}</span>
                          </div>
                        </div>
                      </div>
                      <div className="appointment-actions">
                        <span className={`status-badge status-${app.status}`}>
                          {app.status === 'pending' ? 'In attesa' : 'Confermato'}
                        </span>
                        <Link to={`/patient/appointments/${app.id}`} className="btn-view" style={{ marginLeft: '1rem' }}>
                          Dettagli
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-state-icon"><IconCalendar size={48} /></span>
                <p>Non hai appuntamenti in programma.</p>
                <Link to="/patient/book" className="home-link" style={{ color: '#007bff' }}>
                  Prenota il tuo primo esame
                </Link>
              </div>
            )}
          </section>
        </div>

        <aside className="dashboard-sidebar">
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Azioni Rapide</h2>
            </div>
            <div className="quick-actions">
              <Link to="/patient/book" className="action-card">
                <div className="action-icon"><IconPlus size={20} /></div>
                <div className="action-info">
                  <h3>Nuova Prenotazione</h3>
                  <p>Prenota un nuovo esame</p>
                </div>
              </Link>
              <Link to="/patient/profile" className="action-card">
                <div className="action-icon"><IconUser size={20} /></div>
                <div className="action-info">
                  <h3>Il mio Profilo</h3>
                  <p>Gestisci i tuoi dati</p>
                </div>
              </Link>
              <Link to="/exams" className="action-card">
                <div className="action-icon"><IconList size={20} /></div>
                <div className="action-info">
                  <h3>Lista Esami</h3>
                  <p>Sfoglia gli esami disponibili</p>
                </div>
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default PatientDashboardPage;
