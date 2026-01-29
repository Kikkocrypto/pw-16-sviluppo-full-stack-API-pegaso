import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAppointments } from '../../api/services/appointments/appointmentService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { IconCalendar, IconClock, IconUser, IconList, IconCheck, IconX, IconAlertTriangle } from '../../components/common/Icons';
import { useToast } from '../../contexts/ToastContext';
import { getErrorMessage } from '../../utils/errorUtils';
import './DoctorAppointmentsPage.css';
// Pagina di gestione degli appuntamenti per il dottore
function DoctorAppointmentsPage() {
  const navigate = useNavigate();
  const { showError } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, completed, cancelled

  useEffect(() => {
    loadAppointments();
  }, []);

  // Recupera la lista degli appuntamenti
  const loadAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAppointments();
      setAppointments(data);
    } catch (err) {
      console.error('Error loading doctor appointments:', err);
      setError('Impossibile caricare l\'agenda appuntamenti. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  // Formatta la data
  const formatDate = (dateValue) => {
    if (!dateValue) return { day: '?', month: '?', time: '?', full: 'Data non disponibile' };
    
    let date;
    if (Array.isArray(dateValue)) {
      const [year, month, day, hour, minute] = dateValue;
      date = new Date(Date.UTC(year, month - 1, day, hour || 0, minute || 0));
    } else {
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
      full: date.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
    };
  };

  // Filtra gli appuntamenti in base al filtro selezionato
  const filteredAppointments = appointments.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  if (loading) return <LoadingSpinner message="Caricamento agenda..." />;

  return (
    <div className="doctor-appointments-page">
      <header className="page-header">
        <div className="header-content-main">
          <h1>Agenda Appuntamenti</h1>
          <p>Gestisci le tue visite e il tuo calendario</p>
        </div>
        <div className="header-actions">
          <button className="back-button" onClick={() => navigate('/doctor/dashboard')}>
            ← Torna alla Dashboard
          </button>
        </div>
      </header>

      <div className="filter-bar">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Tutti
        </button>
        <button 
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Da confermare
        </button>
        <button 
          className={`filter-btn ${filter === 'confirmed' ? 'active' : ''}`}
          onClick={() => setFilter('confirmed')}
        >
          Confermati
        </button>
        <button 
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completati
        </button>
        <button 
          className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
          onClick={() => setFilter('cancelled')}
        >
          Annullati
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={loadAppointments} />}

      {!error && (
        <div className="appointments-container">
          {filteredAppointments.length > 0 ? (
            <div className="appointments-grid">
              {filteredAppointments.map(app => {
                const date = formatDate(app.appointmentDate);
                const isCancelled = app.status === 'cancelled';
                const patientName = `${app.patientFirstName} ${app.patientLastName}`;
                
                return (
                  <div key={app.id} className={`appointment-card-full ${isCancelled ? 'cancelled' : ''}`}>
                    <div className="card-left">
                      <div className="date-badge">
                        <span className="day">{date.day}</span>
                        <span className="month">{date.month}</span>
                      </div>
                    </div>
                    
                    <div className="card-center">
                      <div className="exam-info">
                        <h3>{app.examName}</h3>
                        <span className={`status-tag status-${app.status}`}>
                          {app.status === 'pending' ? 'In attesa' : 
                           app.status === 'confirmed' ? 'Confermato' : 
                           app.status === 'completed' ? 'Completato' : 'Annullato'}
                        </span>
                      </div>
                      
                      <div className="meta-info">
                        <div className="meta-item">
                          <span className="icon"><IconClock size={16} /></span>
                          <span>{date.time}</span>
                        </div>
                        <div className="meta-item">
                          <span className="icon"><IconUser size={16} /></span>
                          <span>{patientName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="card-right">
                      <Link to={`/doctor/appointments/${app.id}`} className="btn-details">
                        Gestisci
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state-full">
              <div className="empty-icon"><IconCalendar size={48} /></div>
              <h2>Nessun appuntamento trovato</h2>
              <p>Non ci sono appuntamenti che corrispondono al filtro selezionato.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DoctorAppointmentsPage;
