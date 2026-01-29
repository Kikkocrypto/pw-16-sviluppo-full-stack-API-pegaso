import React, { useState, useEffect } from 'react';
import { 
  getAllPatientsAdmin, 
  deletePatientAdmin, 
  getPatientAppointments 
} from '../../api/services/patient/patientService';
import { LoadingSpinner, ErrorMessage, ConfirmDialog } from '../../components/common';
import AdminQuickNav from '../../components/common/AdminQuickNav';
import { IconX, IconList, IconTrash } from '../../components/common/Icons';
import { useToast } from '../../contexts/ToastContext';
import { getDoctorTitle, formatDateTime } from '../../utils/formatters';
import './AdminPatientsPage.css';
// Pagina di gestione dei pazienti per l'admin
function AdminPatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for detail modal
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  
  // State for delete confirmation
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    fetchPatients();
  }, []);

  // Recupera la lista dei pazienti
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await getAllPatientsAdmin();
      setPatients(data);
      setError(null);
    } catch (err) {
      setError('Impossibile caricare la lista dei pazienti. Riprova più tardi.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Apri il dialog di dettagli per un paziente
  const handleViewDetails = async (patient) => {
    setSelectedPatient(patient);
    setLoadingAppointments(true);
    try {
      const appts = await getPatientAppointments(patient.id);
      setAppointments(appts);
    } catch (err) {
      console.error('Errore nel caricamento appuntamenti:', err);
      showToast('Errore nel caricamento degli appuntamenti', 'error');
    } finally {
      setLoadingAppointments(false);
    }
  };

  // Apri il dialog di eliminazione per un paziente
  const handleDeleteClick = (patient) => {
    setPatientToDelete(patient);
  };

  // Elimina un paziente
  const confirmDelete = async () => {
    if (!patientToDelete) return;
    
    setIsDeleting(true);
    try {
      await deletePatientAdmin(patientToDelete.id);
      showToast('Paziente eliminato con successo', 'success');
      setPatients(patients.filter(p => p.id !== patientToDelete.id));
      setPatientToDelete(null);
    } catch (err) {
      console.error(err);
      const message = err.message || 'Impossibile eliminare il paziente.';
      showToast(message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Filtra i pazienti in base al termine di ricerca e al nome o email
  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
    const email = (patient.email || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || email.includes(search);
  });

  if (loading) return <LoadingSpinner label="Caricamento pazienti..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchPatients} />;

  return (
    <div className="admin-patients-container">
      <AdminQuickNav />
      <div className="admin-patients-header">
        <h2>Gestione Pazienti</h2>
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Cerca per nome o email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="patients-table-container">
        <table className="patients-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Cognome</th>
              <th>Email</th>
              <th>Telefono</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length > 0 ? (
              filteredPatients.map(patient => (
                <tr key={patient.id}>
                  <td data-label="Nome">{patient.firstName}</td>
                  <td data-label="Cognome">{patient.lastName}</td>
                  <td data-label="Email">{patient.email || '-'}</td>
                  <td data-label="Telefono">{patient.phoneNumber || '-'}</td>
                  <td data-label="Azioni">
                    <div className="actions-cell">
                      <button 
                        className="btn-icon view"
                        onClick={() => handleViewDetails(patient)}
                        title="Dettagli"
                      >
                        <IconList size={16} />
                      </button>
                      <button 
                        className="btn-icon delete"
                        onClick={() => handleDeleteClick(patient)}
                        title="Elimina"
                      >
                        <IconTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}> Nessun paziente trovato </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Patient Details Modal */}
      {selectedPatient && (
        <div className="patient-detail-overlay">
          <div className="patient-detail-modal">
            <button className="close-modal" onClick={() => setSelectedPatient(null)}>
              <IconX size={24} />
            </button>
            
            <div className="detail-section">
              <h3>Dati Personali</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Nome Completo</label>
                  <span>{selectedPatient.firstName} {selectedPatient.lastName}</span>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <span>{selectedPatient.email || '-'}</span>
                </div>
                <div className="info-item">
                  <label>Telefono</label>
                  <span>{selectedPatient.phoneNumber || '-'}</span>
                </div>
                <div className="info-item">
                  <label>Data di Nascita</label>
                  <span>{selectedPatient.dateOfBirth ? new Date(selectedPatient.dateOfBirth).toLocaleDateString() : '-'}</span>
                </div>
                <div className="info-item">
                  <label>Genere</label>
                  <span>{selectedPatient.gender || '-'}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Appuntamenti Schedulati</h3>
              {loadingAppointments ? (
                <LoadingSpinner label="Caricamento appuntamenti..." />
              ) : appointments.length > 0 ? (
                <ul className="appointments-list">
                  {appointments.map(appt => (
                    <li key={appt.id} className="appointment-item">
                      <div className="appointment-info">
                        <span className="appointment-date">
                          {new Date(appt.appointmentDate).toLocaleString([], { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        <span className="appointment-meta">
                          {appt.examName} • {getDoctorTitle(appt.doctorGender)} {appt.doctorLastName}
                        </span>
                      </div>
                      <span className={`status-badge status-${appt.status}`}>
                        {appt.status}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-appointments">Nessun appuntamento schedulato</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      {patientToDelete && (
        <ConfirmDialog
          isOpen={!!patientToDelete}
          title="Elimina Paziente"
          message={`Sei sicuro di voler eliminare il paziente ${patientToDelete.firstName} ${patientToDelete.lastName}? Questa operazione non può essere annullata.`}
          confirmLabel={isDeleting ? "Eliminazione..." : "Elimina"}
          cancelLabel="Annulla"
          onConfirm={confirmDelete}
          onCancel={() => setPatientToDelete(null)}
          isDanger={true}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}

export default AdminPatientsPage;
