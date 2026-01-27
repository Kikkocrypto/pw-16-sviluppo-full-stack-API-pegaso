import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDoctorProfile } from '../../api/services/doctor/doctorService';
import { getAppointments } from '../../api/services/appointments/appointmentService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { IconCalendar, IconClock, IconUser, IconList } from '../../components/common/Icons';
import './DoctorDashboardPage.css';

function DoctorDashboardPage() {
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileData, appointmentsData] = await Promise.all([
        getDoctorProfile(),
        getAppointments({ limit: 10 }) // I dottori vedono più appuntamenti
      ]);
      console.log('Doctor Dashboard data loaded:', { profileData, appointmentsData });
      setDoctor(profileData);
      setAppointments(appointmentsData);
    } catch (err) {
      console.error('Error loading doctor dashboard data:', err);
      setError('Impossibile caricare i dati della dashboard. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Caricamento dashboard dottore..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadDashboardData} />;
  }

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
      return { day: '?', month: '?', time: '?', full: 'Data non valida' };
    }

    return {
      day: String(date.getDate()),
      month: date.toLocaleString('it-IT', { month: 'short' }),
      time: date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  // Statistiche per il dottore
  const today = new Date().toISOString().split('T')[0];
  const appointmentsToday = appointments.filter(app => {
    if (!app.appointmentDate) return false;
    const appDate = Array.isArray(app.appointmentDate) 
      ? new Date(Date.UTC(app.appointmentDate[0], app.appointmentDate[1] - 1, app.appointmentDate[2])).toISOString().split('T')[0]
      : new Date(app.appointmentDate).toISOString().split('T')[0];
    return appDate === today && app.status !== 'cancelled';
  }).length;

  const pendingAppointments = appointments.filter(app => app.status === 'pending').length;
  const activeAppointments = appointments.filter(app => app && app.status !== 'cancelled' && app.status !== 'completed');
  const completedAppointments = appointments.filter(app => app.status === 'completed').length;

  const getGreeting = () => {
    if (!doctor) return 'Bentornato';
    const bentornato = doctor.gender === 'F' ? 'Bentornata' : 'Bentornato';
    return `${bentornato}, ${getDoctorTitle(doctor.gender)}`;
  };

  return (
    <div className="doctor-dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>{getGreeting()} {doctor?.lastName}</h1>
          <div className="header-meta">
            <p className="welcome-text">Ecco il riepilogo della tua attività per oggi.</p>
          </div>
        </div>
        <div className="header-actions">
          <Link to="/doctor/profile" className="btn-profile-link">
            Il mio Profilo
          </Link>
        </div>
      </header>

      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-value">{appointmentsToday}</span>
          <span className="stat-label">Appuntamenti oggi</span>
        </div>
        <div className="stat-card warning">
          <span className="stat-value">{pendingAppointments}</span>
          <span className="stat-label">Da confermare</span>
        </div>
        <div className="stat-card info">
          <span className="stat-value">{activeAppointments.length}</span>
          <span className="stat-label">In programma</span>
        </div>
        <div className="stat-card success">
          <span className="stat-value">{completedAppointments}</span>
          <span className="stat-label">Completati</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-main">
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Prossimi Appuntamenti</h2>
              <Link to="/doctor/appointments" className="view-all-link">
                Vedi tutti
              </Link>
            </div>

            {activeAppointments.length > 0 ? (
              <div className="appointments-list">
                {activeAppointments.map(app => {
                  const date = formatDate(app.appointmentDate);
                  const patientName = app.patientFirstName && app.patientLastName 
                    ? `${app.patientFirstName} ${app.patientLastName}`
                    : 'Paziente';
                  
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
                            <span className="meta-item"><IconClock size={14} /> {date.time}</span>
                            <span className="meta-item"><IconUser size={14} /> {patientName}</span>
                          </div>
                        </div>
                      </div>
                      <div className="appointment-actions">
                        <span className={`status-badge status-${app.status}`}>
                          {app.status === 'pending' ? 'In attesa' : 
                           app.status === 'confirmed' ? 'Confermato' : 
                           app.status === 'completed' ? 'Completato' : 'Annullato'}
                        </span>
                        <Link to={`/doctor/appointments/${app.id}`} className="btn-manage">
                          Gestisci
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-state-icon"><IconCalendar size={48} /></span>
                <p>Nessun appuntamento in programma.</p>
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
              <Link to="/doctor/appointments" className="action-card">
                <div className="action-icon"><IconCalendar size={20} /></div>
                <div className="action-info">
                  <h3>Agenda Completa</h3>
                  <p>Gestisci tutto il calendario</p>
                </div>
              </Link>
              <Link to="/exams" className="action-card">
                <div className="action-icon"><IconList size={20} /></div>
                <div className="action-info">
                  <h3>Catalogo Esami</h3>
                  <p>Visualizza esami disponibili</p>
                </div>
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default DoctorDashboardPage;
