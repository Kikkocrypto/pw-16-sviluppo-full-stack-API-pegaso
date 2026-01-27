import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAppointmentDetail, updateAppointment } from '../../api/services/appointments/appointmentService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useToast } from '../../contexts/ToastContext';
import { getErrorMessage } from '../../utils/errorUtils';
import './AppointmentManagePage.css';

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

  if (loading) return <LoadingSpinner message="Caricamento dettagli..." />;
  if (error) return <ErrorMessage message={error} onRetry={loadAppointment} />;
  if (!appointment) return <ErrorMessage message="Appuntamento non trovato." />;

  const isCancelled = appointment.status === 'cancelled';
  const isConfirmed = appointment.status === 'confirmed';
  const isPending = appointment.status === 'pending';

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
              {appointment.status === 'pending' ? 'In attesa' : appointment.status === 'confirmed' ? 'Confermato' : 'Annullato'}
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
                  <span className="label">📅 Data e Ora</span>
                  <span className="value">{formatDate(appointment.appointmentDate)}</span>
                </div>
                <div className="info-item">
                  <span className="label">👤 Paziente</span>
                  <span className="value">{appointment.patientFirstName} {appointment.patientLastName}</span>
                </div>
                <div className="info-item">
                  <span className="label">📧 Contatto</span>
                  <span className="value">{appointment.patientEmail || 'Email non disponibile'}</span>
                </div>
              </div>
            </section>

            <div className="notes-section">
              <div className="notes-card">
                <h3>📝 Motivo della visita</h3>
                <p>{appointment.reason || 'Nessun motivo specificato.'}</p>
              </div>
              {appointment.contraindications && (
                <div className="notes-card contraindications">
                  <h3>⚠️ Controindicazioni segnalate</h3>
                  <p>{appointment.contraindications}</p>
                </div>
              )}
            </div>
          </div>

          <aside className="manage-sidebar">
            <div className="actions-card">
              <h3>Azioni Dottore</h3>
              <div className="action-buttons">
                {isPending && (
                  <button 
                    className="btn-confirm" 
                    onClick={() => handleStatusUpdate('confirmed')}
                    disabled={saving}
                  >
                    ✅ Conferma Appuntamento
                  </button>
                )}
                {!isCancelled && (
                  <button 
                    className="btn-cancel-large" 
                    onClick={() => handleStatusUpdate('cancelled')}
                    disabled={saving}
                  >
                    ❌ Annulla Appuntamento
                  </button>
                )}
                {isCancelled && (
                  <p className="info-text">Questo appuntamento è stato annullato e non può essere modificato.</p>
                )}
                {isConfirmed && (
                  <button 
                    className="btn-revert" 
                    onClick={() => handleStatusUpdate('pending')}
                    disabled={saving}
                  >
                    ↩️ Riporta in Attesa
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
