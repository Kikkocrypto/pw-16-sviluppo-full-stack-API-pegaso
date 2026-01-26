import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDoctorProfile } from '../../api/services/doctor/doctorService';
import { getAppointments } from '../../api/services/appointments/appointmentService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
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
      date = new Date(year, month - 1, day, hour || 0, minute || 0);
    } else {
      date = new Date(dateValue);
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

  // Filtra appuntamenti odierni o futuri
  const activeAppointments = appointments.filter(app => app && app.status !== 'cancelled');

  return (
    <div className="doctor-dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Bentornato, Dott. {doctor?.lastName}</h1>
          {doctor?.specialization && (
            <span className="specialization-badge">{doctor.specialization}</span>
          )}
          <p className="welcome-text">Ecco il riepilogo della tua attività.</p>
        </div>
      </header>

      <div className="dashboard-grid">
        <div className="dashboard-main">
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Agenda Appuntamenti</h2>
              <Link to="/doctor/appointments" className="home-link" style={{ color: '#007bff' }}>
                Vedi agenda completa
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
                            <span>🕒 {date.time}</span>
                            <span>👤 {patientName}</span>
                          </div>
                        </div>
                      </div>
                      <div className="appointment-actions">
                        <span className={`status-badge status-${app.status}`}>
                          {app.status === 'pending' ? 'Da confermare' : 'Confermato'}
                        </span>
                        <Link to={`/doctor/appointments/${app.id}`} className="btn-manage" style={{ marginLeft: '1rem' }}>
                          Gestisci
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-state-icon">📅</span>
                <p>Non ci sono appuntamenti in programma per i prossimi giorni.</p>
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
              <Link to="/doctor/profile" className="action-card">
                <div className="action-icon">👨‍⚕️</div>
                <div className="action-info">
                  <h3>Il mio Profilo</h3>
                  <p>Gestisci specializzazioni</p>
                </div>
              </Link>
              <Link to="/doctor/exams" className="action-card">
                <div className="action-icon">📋</div>
                <div className="action-info">
                  <h3>I miei Esami</h3>
                  <p>Configura esami offerti</p>
                </div>
              </Link>
              <Link to="/admin/patients" className="action-card">
                <div className="action-icon">👥</div>
                <div className="action-info">
                  <h3>Anagrafica</h3>
                  <p>Cerca pazienti</p>
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
