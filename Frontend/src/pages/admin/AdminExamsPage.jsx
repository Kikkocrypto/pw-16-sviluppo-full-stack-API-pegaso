import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getExams, createExam, updateExam, deleteExam, assignDoctorToExam, removeDoctorFromExam } from '../../api/services/exam/examService';
import { getDoctors } from '../../api/services/doctor/doctorService';
import { getDoctorTitle } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import AdminQuickNav from '../../components/common/AdminQuickNav';
import { IconDoctor, IconEdit, IconTrash, IconList, IconUser, IconCalendar, IconSettings, IconPlus, IconInfo, IconClock, IconX } from '../../components/common/Icons';
import { useToast } from '../../contexts/ToastContext';
import { validateField } from '../../utils/validation';
import './AdminPage.css';
import './AdminExamsPage.css';

// Pagina di gestione degli esami per l'admin
function AdminExamsPage() {
  const [exams, setExams] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [currentExam, setCurrentExam] = useState(null);
  const [examToDelete, setExamToDelete] = useState(null);
  const [initialFormData, setInitialFormData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    durationMinutes: 30,
    isActive: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const { showToast } = useToast();

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Recupera la lista degli esami e dei dottori
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [examsData, doctorsData] = await Promise.all([
        getExams(),
        getDoctors(100)
      ]);
      setExams(examsData);
      setAllDoctors(doctorsData);
      setError(null);
    } catch (err) {
      setError('Errore nel caricamento dei dati. Riprova più tardi.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Recupera la lista degli esami
  const fetchExams = async () => {
    try {
      const data = await getExams();
      setExams(data);
    } catch (err) {
      console.error('Errore nel refresh degli esami:', err);
    }
  };

  // Apri il dialog di creazione/modifica di un esame
  const handleOpenModal = (exam = null) => {
    const initialData = exam ? {
      name: exam.name,
      description: exam.description || '',
      durationMinutes: exam.durationMinutes,
      isActive: exam.isActive
    } : {
      name: '',
      description: '',
      durationMinutes: 30,
      isActive: true
    };

    if (exam) {
      setCurrentExam(exam);
    } else {
      setCurrentExam(null);
    }
    
    setFormData(initialData);
    setInitialFormData(initialData);
    setFormErrors({});
    setTouchedFields({});
    setIsModalOpen(true);
  };

  // Verifica se il form è cambiato
  const isFormChanged = () => {
    if (!initialFormData) return false;
    return JSON.stringify(formData) !== JSON.stringify(initialFormData);
  };

  // Verifica se il form è valido
  const isFormValid = () => {
    return (
      formData.name.trim() !== '' &&
      formData.durationMinutes !== '' &&
      formData.durationMinutes > 0 &&
      !formErrors.name &&
      !formErrors.durationMinutes
    );
  };

  // Chiude il dialog di creazione/modifica di un esame
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentExam(null);
    setFormErrors({});
    setTouchedFields({});
  };

  // Apri il dialog di gestione dei dottori per un esame
  const handleOpenDoctorModal = (exam) => {
    setCurrentExam(exam);
    setIsDoctorModalOpen(true);
  };

  // Chiude il dialog di gestione dei dottori per un esame
  const handleCloseDoctorModal = () => {
    setIsDoctorModalOpen(false);
    setCurrentExam(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    if (name === 'name' || name === 'durationMinutes') {
      const fieldToValidate = name === 'name' ? 'examName' : name;
      const error = validateField(fieldToValidate, fieldValue);
      setFormErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));
    
    if (name === 'name' || name === 'durationMinutes') {
      const fieldToValidate = name === 'name' ? 'examName' : name;
      const error = validateField(fieldToValidate, formData[name]);
      setFormErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nameError = validateField('examName', formData.name);
    const durationError = validateField('durationMinutes', formData.durationMinutes);

    if (nameError || durationError) {
      setFormErrors({
        name: nameError,
        durationMinutes: durationError
      });
      setTouchedFields({
        name: true,
        durationMinutes: true
      });
      return;
    }

    try {
      if (currentExam) {
        await updateExam(currentExam.id, formData);
        showToast('Esame aggiornato con successo', 'success');
      } else {
        await createExam(formData);
        showToast('Esame creato con successo', 'success');
      }
      handleCloseModal();
      fetchExams();
    } catch (err) {
      showToast(err.message || 'Errore durante il salvataggio dell\'esame', 'error');
    }
  };

  const handleDeleteClick = (exam) => {
    setExamToDelete(exam);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteExam(examToDelete.id);
      showToast('Esame eliminato con successo', 'success');
      fetchExams();
    } catch (err) {
      showToast(err.message || 'Errore durante l\'eliminazione dell\'esame', 'error');
    } finally {
      setIsConfirmOpen(false);
      setExamToDelete(null);
    }
  };

  const handleToggleDoctorAssignment = async (doctorId, isAssigned) => {
    try {
      if (isAssigned) {
        await removeDoctorFromExam(currentExam.id, doctorId);
        showToast('Dottore rimosso dall\'esame', 'success');
      } else {
        await assignDoctorToExam(currentExam.id, doctorId);
        showToast('Dottore assegnato all\'esame', 'success');
      }
      // Refresh doctors data to update UI
      const updatedDoctors = await getDoctors(100);
      setAllDoctors(updatedDoctors);
    } catch (err) {
      showToast(err.message || 'Errore durante l\'aggiornamento dell\'assegnazione', 'error');
    }
  };

  const isDoctorAssignedToExam = (doctor, examId) => {
    return doctor.exams && doctor.exams.some(e => e.examId === examId);
  };

  if (loading && exams.length === 0) return <LoadingSpinner />;

  return (
    <div className="admin-exams-page">
      <AdminQuickNav />
      <div className="admin-header">
        <h2>Gestione Esami</h2>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <IconPlus size={18} /> Nuovo Esame
        </button>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th><IconList size={14} /> Nome</th>
              <th><IconInfo size={14} /> Descrizione</th>
              <th><IconClock size={14} /> Durata (min)</th>
              <th><IconSettings size={14} /> Stato</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {exams.map(exam => (
              <tr key={exam.id}>
                <td data-label="Nome">{exam.name}</td>
                <td data-label="Descrizione">{exam.description || '-'}</td>
                <td data-label="Durata (min)">{exam.durationMinutes}</td>
                <td data-label="Stato">
                  <span className={`status-badge ${exam.isActive ? 'active' : 'inactive'}`}>
                    {exam.isActive ? 'Attivo' : 'Inattivo'}
                  </span>
                </td>
                <td data-label="Azioni" className="actions">
                  <Link to={`/exams/${exam.id}`} className="btn-icon" title="Vedi Dettagli">
                    <IconList size={18} />
                  </Link>
                  <button className="btn-icon" onClick={() => handleOpenDoctorModal(exam)} title="Gestisci Dottori">
                    <IconDoctor size={18} />
                  </button>
                  <button className="btn-icon" onClick={() => handleOpenModal(exam)} title="Modifica">
                    <IconEdit size={18} />
                  </button>
                  <button className="btn-icon delete" onClick={() => handleDeleteClick(exam)} title="Elimina">
                    <IconTrash size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {exams.length === 0 && !loading && (
              <tr>
                <td colSpan="5" className="empty-row">Nessun esame trovato.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{currentExam ? 'Modifica Esame' : 'Nuovo Esame'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name"><IconList size={14} /> Nome Esame*</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={touchedFields.name && formErrors.name ? 'input-error' : ''}
                  required
                />
                {touchedFields.name && formErrors.name && (
                  <span className="error-text">{formErrors.name}</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="description"><IconInfo size={14} /> Descrizione</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label htmlFor="durationMinutes"><IconClock size={14} /> Durata (minuti)*</label>
                <input
                  type="number"
                  id="durationMinutes"
                  name="durationMinutes"
                  value={formData.durationMinutes}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={touchedFields.durationMinutes && formErrors.durationMinutes ? 'input-error' : ''}
                  min="1"
                  required
                />
                {touchedFields.durationMinutes && formErrors.durationMinutes && (
                  <span className="error-text">{formErrors.durationMinutes}</span>
                )}
              </div>
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  <IconSettings size={14} /> Attivo
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={handleCloseModal}>
                  Annulla
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={!isFormValid() || (currentExam && !isFormChanged())}
                >
                  {currentExam ? 'Aggiorna Esame' : 'Crea Nuovo Esame'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDoctorModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content doctor-assignment-modal">
            <h3><IconDoctor size={24} /> Gestisci Dottori per: {currentExam?.name}</h3>
            <p className="modal-subtitle">Seleziona i medici abilitati a eseguire questo esame.</p>
            
            <div className="doctor-selection-list">
              {allDoctors.map(doctor => {
                const isAssigned = isDoctorAssignedToExam(doctor, currentExam?.id);
                return (
                  <div key={doctor.id} className={`doctor-selection-item ${isAssigned ? 'assigned' : ''}`}>
                    <div className="doctor-info">
                      <span className="doctor-name"><IconUser size={16} /> {getDoctorTitle(doctor.gender)} {doctor.firstName} {doctor.lastName}</span>
                    </div>
                    <button 
                      className={`btn-assign ${isAssigned ? 'remove' : 'add'}`}
                      onClick={() => handleToggleDoctorAssignment(doctor.id, isAssigned)}
                    >
                      {isAssigned ? <><IconX size={14} /> Rimuovi</> : <><IconPlus size={14} /> Assegna</>}
                    </button>
                  </div>
                );
              })}
              {allDoctors.length === 0 && (
                <p className="empty-row">Nessun dottore trovato nel sistema.</p>
              )}
            </div>
            
            <div className="modal-actions">
              <button type="button" className="btn-primary" onClick={handleCloseDoctorModal}>
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Elimina Esame"
        message={`Sei sicuro di voler eliminare l'esame "${examToDelete?.name}"? Questa operazione non può essere annullata.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
        isDanger={true}
      />

      {/* Rimosso style jsx per usare file CSS esterno */}
    </div>
  );
}

export default AdminExamsPage;
