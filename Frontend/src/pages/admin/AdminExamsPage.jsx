import React, { useState, useEffect } from 'react';
import { getExams, createExam, updateExam, deleteExam, assignDoctorToExam, removeDoctorFromExam } from '../../api/services/exam/examService';
import { getDoctors } from '../../api/services/doctor/doctorService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useToast } from '../../contexts/ToastContext';
import { validateField } from '../../utils/validation';
import './AdminPage.css';

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

  const fetchExams = async () => {
    try {
      const data = await getExams();
      setExams(data);
    } catch (err) {
      console.error('Errore nel refresh degli esami:', err);
    }
  };

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

  const isFormChanged = () => {
    if (!initialFormData) return false;
    return JSON.stringify(formData) !== JSON.stringify(initialFormData);
  };

  const isFormValid = () => {
    return (
      formData.name.trim() !== '' &&
      formData.durationMinutes !== '' &&
      formData.durationMinutes > 0 &&
      !formErrors.name &&
      !formErrors.durationMinutes
    );
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentExam(null);
    setFormErrors({});
    setTouchedFields({});
  };

  const handleOpenDoctorModal = (exam) => {
    setCurrentExam(exam);
    setIsDoctorModalOpen(true);
  };

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
      <div className="admin-header">
        <h2>Gestione Esami</h2>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          Nuovo Esame
        </button>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Descrizione</th>
              <th>Durata (min)</th>
              <th>Stato</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {exams.map(exam => (
              <tr key={exam.id}>
                <td>{exam.name}</td>
                <td>{exam.description || '-'}</td>
                <td>{exam.durationMinutes}</td>
                <td>
                  <span className={`status-badge ${exam.isActive ? 'active' : 'inactive'}`}>
                    {exam.isActive ? 'Attivo' : 'Inattivo'}
                  </span>
                </td>
                <td className="actions">
                  <button className="btn-icon" onClick={() => handleOpenDoctorModal(exam)} title="Gestisci Dottori">
                    👨‍⚕️
                  </button>
                  <button className="btn-icon" onClick={() => handleOpenModal(exam)} title="Modifica">
                    ✏️
                  </button>
                  <button className="btn-icon delete" onClick={() => handleDeleteClick(exam)} title="Elimina">
                    🗑️
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
                <label htmlFor="name">Nome Esame*</label>
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
                <label htmlFor="description">Descrizione</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label htmlFor="durationMinutes">Durata (minuti)*</label>
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
                  Attivo
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Annulla
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={!isFormValid() || (currentExam && !isFormChanged())}
                >
                  {currentExam ? 'Aggiorna' : 'Crea'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDoctorModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content doctor-assignment-modal">
            <h3>Gestisci Dottori per: {currentExam?.name}</h3>
            <p className="modal-subtitle">Seleziona i medici abilitati a eseguire questo esame.</p>
            
            <div className="doctor-selection-list">
              {allDoctors.map(doctor => {
                const isAssigned = isDoctorAssignedToExam(doctor, currentExam?.id);
                return (
                  <div key={doctor.id} className={`doctor-selection-item ${isAssigned ? 'assigned' : ''}`}>
                    <div className="doctor-info">
                      <span className="doctor-name">Dr. {doctor.firstName} {doctor.lastName}</span>
                      <span className="doctor-spec">{doctor.specialization}</span>
                    </div>
                    <button 
                      className={`btn-assign ${isAssigned ? 'remove' : 'add'}`}
                      onClick={() => handleToggleDoctorAssignment(doctor.id, isAssigned)}
                    >
                      {isAssigned ? 'Rimuovi' : 'Assegna'}
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
      />

      <style jsx>{`
        .doctor-assignment-modal {
          max-width: 600px;
        }
        .modal-subtitle {
          color: #666;
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
        }
        .doctor-selection-list {
          max-height: 400px;
          overflow-y: auto;
          border: 1px solid #eee;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }
        .doctor-selection-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #eee;
          transition: background 0.2s;
        }
        .doctor-selection-item:last-child {
          border-bottom: none;
        }
        .doctor-selection-item.assigned {
          background: #f0f7ff;
        }
        .doctor-info {
          display: flex;
          flex-direction: column;
        }
        .doctor-name {
          font-weight: 600;
          color: #2c3e50;
        }
        .doctor-spec {
          font-size: 0.85rem;
          color: #7f8c8d;
        }
        .btn-assign {
          padding: 0.4rem 1rem;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
        }
        .btn-assign.add {
          background: #e6fffa;
          color: #2c7a7b;
          border-color: #b2f5ea;
        }
        .btn-assign.add:hover {
          background: #b2f5ea;
        }
        .btn-assign.remove {
          background: #fff5f5;
          color: #c53030;
          border-color: #feb2b2;
        }
        .btn-assign.remove:hover {
          background: #feb2b2;
        }
      `}</style>
    </div>
  );
}

export default AdminExamsPage;
