import React, { useState, useEffect } from 'react';
import { 
  getAppointments, 
  updateAppointment, 
  cancelAppointment 
} from '../../api/services/appointments/appointmentService';
import { LoadingSpinner, ErrorMessage, ConfirmDialog } from '../../components/common';
import { useToast } from '../../contexts/ToastContext';
import { getDoctorTitle, formatDateTime } from '../../utils/formatters';
import './AdminAppointmentsPage.css';

function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for detail modal
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  // State for delete confirmation
  const [appointmentToDelete, setAppointmentToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await getAppointments();
      setAppointments(data);
      setError(null);
    } catch (err) {
      setError('Impossibile caricare la lista delle prenotazioni. Riprova più tardi.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedAppointment || selectedAppointment.status === newStatus) return;
    
    setUpdatingStatus(true);
    try {
      await updateAppointment(selectedAppointment.id, { status: newStatus });
      showToast('Stato aggiornato con successo', 'success');
      
      // Update local state
      setAppointments(appointments.map(a => 
        a.id === selectedAppointment.id ? { ...a, status: newStatus } : a
      ));
      setSelectedAppointment({ ...selectedAppointment, status: newStatus });
    } catch (err) {
      console.error(err);
      showToast('Errore durante l\'aggiornamento dello stato', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCancelClick = (appointment) => {
    setAppointmentToCancel(appointment);
  };

  const confirmCancel = async () => {
    if (!appointmentToDelete) return;
    
    setIsCancelling(true);
    try {
      await cancelAppointment(appointmentToDelete.id);
      showToast('Prenotazione annullata con successo', 'success');
      
      // Update local state (mark as cancelled)
      setAppointments(appointments.map(a => 
        a.id === appointmentToDelete.id ? { ...a, status: 'cancelled' } : a
      ));
      setAppointmentToCancel(null);
    } catch (err) {
      console.error(err);
      const message = err.message || 'Impossibile annullare la prenotazione.';
      showToast(message, 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  const filteredAppointments = appointments.filter(app => {
    const patientName = `${app.patientFirstName} ${app.patientLastName}`.toLowerCase();
    const doctorName = `${app.doctorFirstName} ${app.doctorLastName}`.toLowerCase();
    const examName = (app.examName || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    
    return patientName.includes(search) || 
           doctorName.includes(search) || 
           examName.includes(search);
  });

  if (loading) return <LoadingSpinner label="Caricamento prenotazioni..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchAppointments} />;

  return (
    <div className="admin-appointments-container">
      <div className="admin-appointments-header">
        <h2>Gestione Prenotazioni</h2>
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Cerca per paziente, dottore o esame..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="appointments-table-container">
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Data e Ora</th>
              <th>Paziente</th>
              <th>Dottore</th>
              <th>Esame</th>
              <th>Stato</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map(app => (
                <tr key={app.id}>
                  <td>{formatDateTime(app.appointmentDate)}</td>
                  <td>{app.patientFirstName} {app.patientLastName}</td>
                  <td>{getDoctorTitle(app.doctorGender)} {app.doctorLastName}</td>
                  <td>{app.examName}</td>
                  <td>
                    <span className={`status-badge status-${app.status}`}>
                      {app.status === 'pending' ? 'In attesa' : app.status === 'confirmed' ? 'Confermato' : 'Annullato'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button 
                      className="btn-view"
                      onClick={() => handleViewDetails(app)}
                    >
                      Dettagli
                    </button>
                    {app.status !== 'cancelled' && (
                      <button 
                        className="btn-delete"
                        onClick={() => handleCancelClick(app)}
                      >
                        Annulla
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                  Nessuna prenotazione trovata
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div className="appointment-detail-overlay">
          <div className="appointment-detail-modal">
            <button className="close-modal" onClick={() => setSelectedAppointment(null)}>&times;</button>
            
            <div className="detail-section">
              <h3>Dettagli Prenotazione</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Data e Ora</label>
                  <span>{formatDateTime(selectedAppointment.appointmentDate)}</span>
                </div>
                <div className="info-item">
                  <label>Stato Attuale</label>
                  <span className={`status-badge status-${selectedAppointment.status}`}>
                    {selectedAppointment.status === 'pending' ? 'In attesa' : selectedAppointment.status === 'confirmed' ? 'Confermato' : 'Annullato'}
                  </span>
                </div>
                <div className="info-item">
                  <label>Esame</label>
                  <span>{selectedAppointment.examName}</span>
                </div>
                <div className="info-item">
                  <label>Durata</label>
                  <span>{selectedAppointment.durationMinutes} minuti</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Soggetti Coinvolti</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Paziente</label>
                  <span>{selectedAppointment.patientFirstName} {selectedAppointment.patientLastName}</span>
                </div>
                <div className="info-item">
                  <label>Email Paziente</label>
                  <span>{selectedAppointment.patientEmail || '-'}</span>
                </div>
                <div className="info-item">
                  <label>Dottore</label>
                  <span>{getDoctorTitle(selectedAppointment.doctorGender)} {selectedAppointment.doctorFirstName} {selectedAppointment.doctorLastName}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Note e Motivo</h3>
              <div className="notes-box">
                {selectedAppointment.reason || 'Nessun motivo specificato'}
              </div>
            </div>

            {selectedAppointment.contraindications && (
              <div className="detail-section">
                <h3>Controindicazioni</h3>
                <div className="notes-box" style={{ color: '#b91c1c', backgroundColor: '#fef2f2' }}>
                  {selectedAppointment.contraindications}
                </div>
              </div>
            )}

            <div className="detail-section">
              <h3>Gestione Stato</h3>
              <div className="status-manager">
                <select 
                  className="status-select"
                  value={selectedAppointment.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updatingStatus}
                >
                  <option value="pending">In attesa</option>
                  <option value="confirmed">Confermato</option>
                  <option value="cancelled">Annullato</option>
                </select>
                {updatingStatus && <span className="updating-text">Aggiornamento...</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Cancel Dialog */}
      {appointmentToDelete && (
        <ConfirmDialog
          isOpen={!!appointmentToDelete}
          title="Annulla Prenotazione"
          message={`Sei sicuro di voler annullare la prenotazione del ${formatDate(appointmentToDelete.appointmentDate)} per il paziente ${appointmentToDelete.patientFirstName} ${appointmentToDelete.patientLastName}?`}
          confirmLabel={isCancelling ? "Annullamento..." : "Annulla Prenotazione"}
          cancelLabel="Mantieni"
          onConfirm={confirmCancel}
          onCancel={() => setAppointmentToCancel(null)}
          isDanger={true}
          isLoading={isCancelling}
        />
      )}
    </div>
  );
}

export default AdminAppointmentsPage;
