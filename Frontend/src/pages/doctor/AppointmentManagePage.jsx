import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAppointmentDetail, updateAppointment } from '../../api/services/appointments/appointmentService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { IconCheck, IconCalendar, IconUser, IconInfo, IconAlertTriangle, IconX, IconClock } from '../../components/common/Icons';
import { useToast } from '../../contexts/ToastContext';
import { getErrorMessage } from '../../utils/errorUtils';
import './AppointmentManagePage.css';

// Pagina di gestione dell'appuntamento per il dottore
function AppointmentManagePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAppointment();
  }, [id]);

  // Recupera i dettagli dell'appuntamento
  const loadAppointment = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAppointmentDetail(id);
      setAppointment(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Impossibile caricare i dettagli dell\'appuntamento.'));
    } finally {
      setLoading(false);
    }
  };

  // Aggiorna lo stato dell'appuntamento
  const handleStatusUpdate = async (newStatus) => {
    setSaving(true);
    try {
      await updateAppointment(id, { status: newStatus });
      showSuccess(`Appuntamento ${newStatus === 'confirmed' ? 'confermato' : 'annullato'} con successo`);
      loadAppointment();
    } catch (err) {
      showError(getErrorMessage(err, 'Errore durante l\'aggiornamento dello stato', true));
    } finally {
      setSaving(false);
    }
  };

  // Formatta la data
  const formatDate = (dateValue) => {
    if (!dateValue) return 'Data non disponibile';
    const date = new Date(dateValue.endsWith('Z') ? dateValue : dateValue + 'Z');
    return date.toLocaleString('it-IT', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Rendere il componente
  if (loading) return <LoadingSpinner message="Caricamento dettagli..." />;
  if (error) return <ErrorMessage message={error} onRetry={loadAppointment} />;
  if (!appointment) return <ErrorMessage message="Appuntamento non trovato." />;

  // Verifica lo stato dell'appuntamento
  const isCancelled = appointment.status === 'cancelled';
  const isConfirmed = appointment.status === 'confirmed';
  const isPending = appointment.status === 'pending';
  const isCompleted = appointment.status === 'completed';

  return (
    <div className="appointment-manage-page">
      <div className="manage-container">
        <header className="manage-header">
          <button className="back-button-simple" onClick={() => navigate(-1)}>
            ← Indietro
          </button>
          <div className="header-main">
            <h1>Gestione Appuntamento</h1>
            <span className={`status-badge-large status-${appointment.status}`}>
              {appointment.status === 'pending' ? 'In attesa' : 
               appointment.status === 'confirmed' ? 'Confermato' : 
               appointment.status === 'completed' ? 'Completato' : 'Annullato'}
            </span>
          </div>
        </header>

        <div className="manage-grid">
          <div className="manage-main">
            <section className="info-card-large">
              <div className="info-header">
                <span className="exam-type">Esame Medico</span>
                <h2>{appointment.examName}</h2>
              </div>
              
              <div className="info-body">
                <div className="info-item">
                  <span className="label"><IconCalendar size={14} /> Data e Ora</span>
                  <span className="value">{formatDate(appointment.appointmentDate)}</span>
                </div>
                <div className="info-item">
                  <span className="label"><IconUser size={14} /> Paziente</span>
                  <span className="value">{appointment.patientFirstName} {appointment.patientLastName}</span>
                </div>
                <div className="info-item">
                  <span className="label"><IconInfo size={14} /> Contatto</span>
                  <span className="value">{appointment.patientEmail || 'Email non disponibile'}</span>
                </div>
              </div>
            </section>

            <div className="notes-section">
              <div className="notes-card">
                <h3><IconInfo size={18} /> Motivo della visita</h3>
                <p>{appointment.reason || 'Nessun motivo specificato.'}</p>
              </div>
              {appointment.contraindications && (
                <div className="notes-card contraindications">
                  <h3><IconAlertTriangle size={18} /> Controindicazioni segnalate</h3>
                  <p>{appointment.contraindications}</p>
                </div>
              )}
            </div>
          </div>

          <aside className="manage-sidebar">
            <div className="actions-card">
              <h3>Azioni Dottore</h3>
              <div className="action-buttons">
                {isConfirmed && (
                  <button 
                    className="btn btn-primary btn-complete" 
                    onClick={() => handleStatusUpdate('completed')}
                    disabled={saving}
                    style={{ width: '100%', marginBottom: 'var(--spacing-md)', background: 'var(--secondary-color)' }}
                  >
                    <IconCheck size={18} /> Chiudi Appuntamento
                  </button>
                )}
                {isPending && (
                  <button 
                    className="btn-confirm" 
                    onClick={() => handleStatusUpdate('confirmed')}
                    disabled={saving}
                  >
                    <IconCheck size={18} /> Conferma Appuntamento
                  </button>
                )}
                {!isCancelled && !isCompleted && (
                  <button 
                    className="btn-cancel-large" 
                    onClick={() => handleStatusUpdate('cancelled')}
                    disabled={saving}
                  >
                    <IconX size={18} /> Annulla Appuntamento
                  </button>
                )}
                {isCancelled && (
                  <p className="info-text">Questo appuntamento è stato annullato e non può essere modificato.</p>
                )}
                {isCompleted && (
                  <p className="info-text" style={{ color: 'var(--secondary-color)', fontWeight: 600 }}>
                    Questo appuntamento è stato completato con successo.
                  </p>
                )}
                {(isConfirmed || isCompleted) && (
                  <button 
                    className="btn-revert" 
                    onClick={() => handleStatusUpdate('pending')}
                    disabled={saving}
                  >
                    <IconClock size={18} /> Riporta in Attesa
                  </button>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default AppointmentManagePage;
