import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAppointmentDetail, updateAppointment, cancelAppointment } from '../../api/services/appointments/appointmentService';
import { getDemoId } from '../../api/demoHeaders';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { IconCalendar, IconDoctor, IconUser, IconEdit, IconTrash, IconX, IconClock, IconAlertTriangle } from '../../components/common/Icons';
import { useToast } from '../../contexts/ToastContext';
import { getErrorMessage } from '../../utils/errorUtils';
import { getDoctorTitle, formatDateTime } from '../../utils/formatters';
import './AppointmentDetailPage.css';

function AppointmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsMenuOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Ruoli correnti
  const patientId = getDemoId('patient');
  const doctorId = getDemoId('doctor');
  const adminId = getDemoId('admin');

  const [formData, setFormData] = useState({
    appointmentDate: '',
    reason: '',
    contraindications: ''
  });

  useEffect(() => {
    loadAppointment();
  }, [id]);

  const loadAppointment = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAppointmentDetail(id);
      setAppointment(data);
      
      // Prepara i dati del form
      setFormData({
        appointmentDate: data.appointmentDate ? data.appointmentDate.slice(0, 16) : '',
        reason: data.reason || '',
        contraindications: data.contraindications || ''
      });
    } catch (err) {
      setError(getErrorMessage(err, 'Impossibile caricare i dettagli dell\'appuntamento.'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Se la data è stata cambiata, aggiungi i secondi per il backend
      let updatePayload = { ...formData };
      if (updatePayload.appointmentDate && updatePayload.appointmentDate.length === 16) {
        updatePayload.appointmentDate += ':00';
      }

      await updateAppointment(id, updatePayload);
      showSuccess('Appuntamento aggiornato con successo');
      setIsMenuOpen(false);
      loadAppointment();
    } catch (err) {
      showError(getErrorMessage(err, 'Errore durante l\'aggiornamento', true));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    try {
      await cancelAppointment(id);
      showSuccess('Appuntamento annullato correttamente');
      setShowCancelConfirm(false);
      loadAppointment();
    } catch (err) {
      showError(getErrorMessage(err, 'Errore durante l\'annullamento', true));
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

  const isPatient = patientId && appointment.patientId === patientId;
  const isDoctor = doctorId && appointment.doctorId === doctorId;
  const isAdmin = !!adminId;
  const isCancelled = appointment.status === 'cancelled';
  const isCompleted = appointment.status === 'completed';
  const isPast = new Date(appointment.appointmentDate) < new Date();

  return (
    <div className="appointment-detail-page">
      <div className="detail-container">
        <header className="detail-header">
          <button className="back-button-simple" onClick={() => navigate(-1)}>
            ← Indietro
          </button>
          <div className="header-main">
            <h1>Dettaglio Appuntamento</h1>
            <span className={`status-badge-large status-${appointment.status}`}>
              {appointment.status === 'pending' ? 'In attesa' : 
               appointment.status === 'confirmed' ? 'Confermato' : 
               appointment.status === 'completed' ? 'Completato' : 'Annullato'}
            </span>
          </div>
        </header>

        <div className="detail-grid">
          <div className="detail-main">
            <section className="info-section">
              <div className="info-card-large">
                <div className="info-header">
                  <span className="exam-type">Esame Medico</span>
                  <h2>{appointment.examName}</h2>
                </div>
                
                <div className="info-body">
                  <div className="info-item">
                    <span className="label"><IconCalendar size={16} /> Data e Ora</span>
                    <span className="value">{formatDate(appointment.appointmentDate)}</span>
                  </div>
                  <div className="info-item">
                    <span className="label"><IconDoctor size={16} /> Medico</span>
                    <span className="value">
                      {getDoctorTitle(appointment.doctorGender)} {appointment.doctorFirstName} {appointment.doctorLastName}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label"><IconUser size={16} /> Paziente</span>
                    <span className="value">{appointment.patientFirstName} {appointment.patientLastName}</span>
                  </div>
                </div>
              </div>

              <div className="notes-section">
                <div className="notes-card">
                  <h3><IconEdit size={18} /> Motivo della visita</h3>
                  <p>{appointment.reason || 'Nessun motivo specificato.'}</p>
                </div>
                <div className="notes-card contraindications">
                  <h3><IconAlertTriangle size={18} /> Controindicazioni</h3>
                  <p>{appointment.contraindications || 'Nessuna controindicazione segnalata.'}</p>
                </div>
              </div>
            </section>
          </div>

          {( (!isCancelled && !isCompleted && !isPast && (isPatient || isAdmin)) || (isCompleted && isAdmin) ) && (
            <aside className="detail-sidebar">
              <div className="actions-card">
                <h3>Azioni Disponibili</h3>
                {!isEditing ? (
                  <div className="action-buttons">
                    {!isCompleted && (
                      <button className="btn btn-secondary btn-edit" onClick={() => setIsMenuOpen(true)} style={{ width: '100%', marginBottom: '0.5rem' }}>
                        <IconEdit size={18} /> Modifica Appuntamento
                      </button>
                    )}
                    <button 
                      className="btn btn-secondary btn-cancel-large" 
                      onClick={() => setShowCancelConfirm(true)} 
                      style={{ 
                        width: '100%', 
                        color: 'var(--error-color)', 
                        borderColor: 'var(--error-color)' 
                      }}
                    >
                      <IconTrash size={18} /> {isCompleted ? 'Elimina Definitivamente' : 'Annulla Appuntamento'}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleUpdate} className="edit-form">
                    <div className="form-group">
                      <label>Cambia Data e Ora</label>
                      <input 
                        type="datetime-local" 
                        name="appointmentDate"
                        value={formData.appointmentDate}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Note / Motivo</label>
                      <textarea 
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        rows="3"
                      />
                    </div>
                    <div className="form-group">
                      <label>Controindicazioni</label>
                      <textarea 
                        name="contraindications"
                        value={formData.contraindications}
                        onChange={handleChange}
                        rows="3"
                      />
                    </div>
                    <div className="edit-actions">
                      <button type="submit" className="btn-save" disabled={saving}>
                        {saving ? 'Salvataggio...' : 'Salva Modifiche'}
                      </button>
                      <button type="button" className="btn-cancel-edit" onClick={() => setIsMenuOpen(false)}>
                        Annulla
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </aside>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showCancelConfirm}
        title={isCompleted ? "Elimina Appuntamento" : "Annulla Appuntamento"}
        message={
          isCompleted 
            ? "Sei sicuro di voler eliminare definitivamente questo appuntamento completato? L'operazione rimuoverà il record dal database."
            : "Sei sicuro di voler annullare questo appuntamento? L'operazione è irreversibile e può essere effettuata solo fino a 48 ore prima della visita."
        }
        onConfirm={handleCancel}
        onCancel={() => setShowCancelConfirm(false)}
        confirmLabel={isCompleted ? "Sì, elimina" : "Sì, annulla"}
        cancelLabel="No, mantieni"
        isDanger={true}
      />
    </div>
  );
}

export default AppointmentDetailPage;
