import React, { useState, useEffect } from 'react';
import { getAppointments, cancelAppointment } from '../../api/services/appointments/appointmentService';
import { LoadingSpinner, ErrorMessage, ConfirmDialog } from '../../components/common';
import AdminQuickNav from '../../components/common/AdminQuickNav';
import { IconList, IconTrash, IconCalendar, IconClock, IconUser, IconDoctor } from '../../components/common/Icons';
import { useToast } from '../../contexts/ToastContext';
import { Link } from 'react-router-dom';
import './AdminAppointmentsPage.css';

// Pagina di gestione delle prenotazioni per l'admin
function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Recupera la lista delle prenotazioni
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

  // Apri il dialog di conferma per annullare una prenotazione
  const handleCancelClick = (appointment) => {
    setAppointmentToCancel(appointment);
  };

  // Annulla una prenotazione
  const confirmCancel = async () => {
    if (!appointmentToCancel) return;
    
    setIsCancelling(true);
    try {
      await cancelAppointment(appointmentToCancel.id);
      showToast('Prenotazione annullata con successo', 'success');
      fetchAppointments(); // Refresh the list
      setAppointmentToCancel(null);
    } catch (err) {
      console.error(err);
      showToast('Impossibile annullare la prenotazione.', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  // Filtra le prenotazioni in base al termine di ricerca e al filtro di stato
  const filteredAppointments = appointments.filter(app => {
    const patientName = `${app.patientFirstName} ${app.patientLastName}`.toLowerCase();
    const doctorName = `${app.doctorFirstName} ${app.doctorLastName}`.toLowerCase();
    const examName = (app.examName || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    
    const matchesSearch = patientName.includes(search) || doctorName.includes(search) || examName.includes(search);
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Formatta la data
  const formatDate = (dateValue) => {
    if (!dateValue) return '-';
    const date = new Date(dateValue.endsWith('Z') ? dateValue : dateValue + 'Z');
    return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Formatta l'ora
  const formatTime = (dateValue) => {
    if (!dateValue) return '-';
    const date = new Date(dateValue.endsWith('Z') ? dateValue : dateValue + 'Z');
    return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <LoadingSpinner label="Caricamento prenotazioni..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchAppointments} />;
  
  // Rendere il componente
  return (
    <div className="admin-appointments-container">
      <AdminQuickNav />
      <div className="admin-appointments-header">
        <h2>Gestione Prenotazioni</h2>
        <div className="filters-bar">
          <input 
            type="text" 
            placeholder="Cerca paziente, medico o esame..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Tutti gli stati</option>
            <option value="pending">In attesa</option>
            <option value="confirmed">Confermati</option>
            <option value="completed">Completati</option>
            <option value="cancelled">Annullati</option>
          </select>
        </div>
      </div>

      <div className="appointments-table-container">
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Data e Ora</th>
              <th>Paziente</th>
              <th>Medico</th>
              <th>Esame</th>
              <th>Stato</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map(app => (
                <tr key={app.id}>
                  <td data-label="Data e Ora">
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600 }}><IconCalendar size={14} /> {formatDate(app.appointmentDate)}</span>
                      <span style={{ color: 'var(--text-muted)' }}><IconClock size={14} /> {formatTime(app.appointmentDate)}</span>
                    </div>
                  </td>
                  <td data-label="Paziente">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <IconUser size={16} color="var(--text-muted)" />
                      {app.patientFirstName} {app.patientLastName}
                    </div>
                  </td>
                  <td data-label="Medico">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <IconDoctor size={16} color="var(--text-muted)" />
                      {app.doctorFirstName} {app.doctorLastName}
                    </div>
                  </td>
                  <td data-label="Esame">{app.examName}</td>
                  <td data-label="Stato">
                    <span className={`status-badge status-${app.status}`}>
                      {app.status === 'pending' ? 'In attesa' : 
                       app.status === 'confirmed' ? 'Confermato' : 
                       app.status === 'completed' ? 'Completato' : 'Annullato'}
                    </span>
                  </td>
                  <td data-label="Azioni">
                    <div className="actions-cell">
                      <Link 
                        to={`/appointments/${app.id}`}
                        className="btn-icon view"
                        title="Dettagli"
                      >
                        <IconList size={16} />
                      </Link>
                      {app.status !== 'cancelled' && (
                        <button 
                          className="btn-icon delete"
                          onClick={() => handleCancelClick(app)}
                          title={app.status === 'completed' ? "Elimina" : "Annulla"}
                        >
                          <IconTrash size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}> Nessuna prenotazione trovata </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {appointmentToCancel && (
        <ConfirmDialog
          isOpen={!!appointmentToCancel}
          title={appointmentToCancel.status === 'completed' ? "Elimina Prenotazione" : "Annulla Prenotazione"}
          message={
            appointmentToCancel.status === 'completed' 
              ? `Sei sicuro di voler eliminare definitivamente la prenotazione completata di ${appointmentToCancel.patientFirstName} ${appointmentToCancel.patientLastName}? Questa operazione rimuoverà il record dal database.`
              : `Sei sicuro di voler annullare la prenotazione di ${appointmentToCancel.patientFirstName} ${appointmentToCancel.patientLastName} per l'esame ${appointmentToCancel.examName}?`
          }
          confirmLabel={isCancelling ? (appointmentToCancel.status === 'completed' ? "Eliminazione..." : "Annullamento...") : (appointmentToCancel.status === 'completed' ? "Sì, elimina" : "Sì, annulla")}
          cancelLabel="No, mantieni"
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
