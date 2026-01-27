import React, { useState, useEffect } from 'react';
import { 
  getAllDoctorsAdmin, 
  deleteDoctorAdmin, 
  getDoctorAppointments 
} from '../../api/services/doctor/doctorService';
import { LoadingSpinner, ErrorMessage, ConfirmDialog } from '../../components/common';
import { useToast } from '../../contexts/ToastContext';
import { getDoctorTitle, formatDateTime } from '../../utils/formatters';
import './AdminDoctorsPage.css';

function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for detail modal
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  
  // State for delete confirmation
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const data = await getAllDoctorsAdmin();
      setDoctors(data);
      setError(null);
    } catch (err) {
      setError('Impossibile caricare la lista dei dottori. Riprova più tardi.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (doctor) => {
    setSelectedDoctor(doctor);
    setLoadingAppointments(true);
    try {
      const appts = await getDoctorAppointments(doctor.id);
      setAppointments(appts);
    } catch (err) {
      console.error('Errore nel caricamento appuntamenti:', err);
      showToast('Errore nel caricamento degli appuntamenti', 'error');
    } finally {
      setLoadingAppointments(false);
    }
  };

  const handleDeleteClick = (doctor) => {
    setDoctorToDelete(doctor);
  };

  const confirmDelete = async () => {
    if (!doctorToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteDoctorAdmin(doctorToDelete.id);
      showToast('Dottore eliminato con successo', 'success');
      setDoctors(doctors.filter(d => d.id !== doctorToDelete.id));
      setDoctorToDelete(null);
    } catch (err) {
      console.error(err);
      const message = err.message || 'Impossibile eliminare il dottore.';
      showToast(message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const fullName = `${doctor.firstName} ${doctor.lastName}`.toLowerCase();
    const specialization = (doctor.specialization || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || specialization.includes(search);
  });

  if (loading) return <LoadingSpinner label="Caricamento dottori..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchDoctors} />;

  return (
    <div className="admin-doctors-container">
      <div className="admin-doctors-header">
        <h2>Gestione Dottori</h2>
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Cerca per nome o specializzazione..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="doctors-table-container">
        <table className="doctors-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Cognome</th>
              <th>Esami</th>
              <th>Email</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map(doctor => (
                <tr key={doctor.id}>
                  <td>{doctor.firstName}</td>
                  <td>{doctor.lastName}</td>
                  <td>
                    <div className="exams-list-cell">
                      {doctor.exams && doctor.exams.length > 0 ? (
                        doctor.exams.slice(0, 2).map(exam => (
                          <span key={exam.examId} className="exam-tag-mini">
                            {exam.examName}
                          </span>
                        ))
                      ) : '-'}
                      {doctor.exams && doctor.exams.length > 2 && (
                        <span className="exam-tag-more">+{doctor.exams.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td>{doctor.email || '-'}</td>
                  <td className="actions-cell">
                    <button 
                      className="btn-view"
                      onClick={() => handleViewDetails(doctor)}
                    >
                      Dettagli
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDeleteClick(doctor)}
                    >
                      Elimina
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}> Nessun dottore trovato </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Doctor Details Modal */}
      {selectedDoctor && (
        <div className="doctor-detail-overlay">
          <div className="doctor-detail-modal">
            <button className="close-modal" onClick={() => setSelectedDoctor(null)}>&times;</button>
            
            <div className="detail-section">
              <h3>Dati Professionali</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Nome Completo</label>
                  <span>{getDoctorTitle(selectedDoctor.gender)} {selectedDoctor.firstName} {selectedDoctor.lastName}</span>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <span>{selectedDoctor.email || '-'}</span>
                </div>
                <div className="info-item">
                  <label>Telefono</label>
                  <span>{selectedDoctor.phoneNumber || '-'}</span>
                </div>
                <div className="info-item">
                  <label>Genere</label>
                  <span>{selectedDoctor.gender || '-'}</span>
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
                          {formatDateTime(appt.appointmentDate)}
                        </span>
                        <span className="appointment-meta">
                          {appt.examName} • Paziente: {appt.patientLastName}
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
      {doctorToDelete && (
        <ConfirmDialog
          isOpen={!!doctorToDelete}
          title="Elimina Dottore"
          message={`Sei sicuro di voler eliminare il dottore ${doctorToDelete.firstName} ${doctorToDelete.lastName}? Questa operazione non può essere annullata.`}
          confirmLabel={isDeleting ? "Eliminazione..." : "Elimina"}
          cancelLabel="Annulla"
          onConfirm={confirmDelete}
          onCancel={() => setDoctorToDelete(null)}
          isDanger={true}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}

export default AdminDoctorsPage;
