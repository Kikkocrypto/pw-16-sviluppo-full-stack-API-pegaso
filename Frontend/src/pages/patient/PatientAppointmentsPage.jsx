import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAppointments, cancelAppointment } from '../../api/services/appointments/appointmentService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useToast } from '../../contexts/ToastContext';
import { getErrorMessage } from '../../utils/errorUtils';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { IconCalendar, IconClock, IconDoctor, IconList, IconTrash, IconPlus } from '../../components/common/Icons';
import './PatientAppointmentsPage.css';

function PatientAppointmentsPage() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAppointments();
      setAppointments(data);
    } catch (err) {
      setError('Impossibile caricare i tuoi appuntamenti. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = (appointment) => {
    setAppointmentToCancel(appointment);
    setShowCancelConfirm(true);
  };

  const handleConfirmCancel = async () => {
    if (!appointmentToCancel) return;

    try {
      await cancelAppointment(appointmentToCancel.id);
      showSuccess('Appuntamento annullato con successo');
      loadAppointments(); // Ricarica la lista
    } catch (err) {
      showError(getErrorMessage(err, 'Errore durante l\'annullamento dell\'appuntamento'));
    } finally {
      setShowCancelConfirm(false);
      setAppointmentToCancel(null);
    }
  };

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

  if (loading) return <LoadingSpinner message="Caricamento appuntamenti..." />;

  return (
    <div className="patient-appointments-page">
      <header className="page-header">
        <div className="header-content-main">
          <h1>I miei Appuntamenti</h1>
          <p>Visualizza lo storico e gestisci le tue prenotazioni</p>
        </div>
        <div className="header-actions">
          <Link to="/patient/book" className="btn btn-primary">
            <IconPlus size={18} /> Nuova Prenotazione
          </Link>
          <button className="btn btn-secondary" onClick={() => navigate('/patient/dashboard')}>
            Indietro
          </button>
        </div>
      </header>

      {error && <ErrorMessage message={error} onRetry={loadAppointments} />}

      {!error && (
        <div className="appointments-container">
          {appointments.length > 0 ? (
            <div className="appointments-grid">
              {appointments.map(app => {
                const date = formatDate(app.appointmentDate);
                const isCancelled = app.status === 'cancelled';
                const isPast = new Date(app.appointmentDate) < new Date();
                
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
                          <span className="icon"><IconClock size={14} /></span>
                          <span>{date.time}</span>
                        </div>
                        <div className="meta-item">
                          <span className="icon"><IconDoctor size={14} /></span>
                          <span>
                            {getDoctorTitle(app.doctorGender)} {app.doctorFirstName} {app.doctorLastName}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="card-right">
                      {!isCancelled && !isPast && (
                        <button 
                          className="btn btn-secondary btn-cancel" 
                          onClick={() => handleCancelClick(app)}
                          style={{ color: 'var(--error-color)', borderColor: 'var(--error-color)' }}
                        >
                          <IconTrash size={16} /> Annulla
                        </button>
                      )}
                      <Link to={`/patient/appointments/${app.id}`} className="btn btn-primary btn-details">
                        <IconList size={16} /> Dettagli
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
              <p>Non hai ancora effettuato alcuna prenotazione.</p>
              <Link to="/patient/book" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
                <IconPlus size={18} /> Prenota il tuo primo esame
              </Link>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={showCancelConfirm}
        title="Annulla Appuntamento"
        message={`Sei sicuro di voler annullare l'appuntamento per "${appointmentToCancel?.examName}" del ${formatDate(appointmentToCancel?.appointmentDate).full}? L'operazione è possibile solo fino a 48 ore prima.`}
        onConfirm={handleConfirmCancel}
        onCancel={() => setShowCancelConfirm(false)}
        confirmLabel="Sì, annulla"
        cancelLabel="No, mantieni"
      />
    </div>
  );
}

export default PatientAppointmentsPage;
