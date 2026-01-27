// Pagina di accesso demo per dottori

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDoctors, createDoctor } from '../../api/services/doctor/doctorService';
import { getExams } from '../../api/services/exam/examService';
import { setDemoId } from '../../api/demoHeaders';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useToast } from '../../contexts/ToastContext';
import { validateField as validateFieldUtil, validateDoctorForm } from '../../utils/validation';
import { normalizePhoneNumber, ensurePhonePrefix } from '../../utils/phoneUtils';
import { getErrorMessage } from '../../utils/errorUtils';
import './DoctorAccessPage.css';

function DoctorAccessPage() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  
  // Modalità: 'select' per selezione utente esistente, 'create' per creazione nuovo
  const [mode, setMode] = useState(null);
  
  // Stato per la modalità "Accedi"
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [errorDoctors, setErrorDoctors] = useState(null);
  
  // Stato per la modalità "Crea nuovo"
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    email: '',
    phoneNumber: '',
    examIds: [],
  });
  const [formErrors, setFormErrors] = useState({});
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);
  
  // Stato per la lista esami disponibili
  const [availableExams, setAvailableExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(false);


  useEffect(() => {
    if (mode === 'select') {
      loadDoctors();
    } else if (mode === 'create') {
      loadExams();
    }
  }, [mode]);

  // Caricamento lista esami
  const loadExams = async () => {
    setLoadingExams(true);
    try {
      const data = await getExams(true); // Solo esami attivi
      setAvailableExams(data);
    } catch (error) {
      console.error('Errore nel caricamento degli esami:', error);
    } finally {
      setLoadingExams(false);
    }
  };

// Caricamento lista dottori
  const loadDoctors = async () => {
    setLoadingDoctors(true);
    setErrorDoctors(null);
    try {
      const data = await getDoctors(10);
      setDoctors(data);
      if (data.length === 0) {
        setErrorDoctors('Nessun dottore trovato. Crea un nuovo dottore per iniziare.');
      }
    } catch (error) {
      const errorMsg = getErrorMessage(error, 'Errore nel caricamento dei dottori');
      setErrorDoctors(errorMsg);
      showError(errorMsg);
    } finally {
      setLoadingDoctors(false);
    }
  };
// Selezione dottore
  const handleSelectDoctor = () => {
    if (!selectedDoctorId) {
      const errorMsg = 'Seleziona un dottore dalla lista';
      setErrorDoctors(errorMsg);
      showError(errorMsg);
      return;
    }

    // Salva l'ID nel localStorage
    setDemoId('doctor', selectedDoctorId);
    showSuccess('Accesso effettuato! Reindirizzamento...');
    
    setTimeout(() => {
      navigate('/doctor/dashboard');
    }, 800);
  };

  // Validazione in tempo reale per un singolo campo (usa utility condivisa)
  const validateField = (name, value) => {
    const errors = { ...formErrors };
    const error = validateFieldUtil(name, value, { required: name === 'firstName' || name === 'lastName' });
    
    if (error) {
      errors[name] = error;
    } else {
      delete errors[name];
    }
    
    setFormErrors(errors);
  };

  // Validazione completa del form (per il submit) - usa utility condivisa
  const validateForm = () => {
    const errors = validateDoctorForm(formData);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

// Creazione dottore
  const handleCreateDoctor = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setCreating(true);
    setCreateError(null);

    try {
      // Prepara i dati per l'API (rimuove campi vuoti)
      // Per il telefono, usa utility condivisa per assicurarsi del prefisso +39
      const doctorData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        gender: formData.gender || null,
        email: formData.email.trim() || null,
        phoneNumber: ensurePhonePrefix(formData.phoneNumber),
        examIds: formData.examIds.length > 0 ? formData.examIds : null,
      };

      const newDoctor = await createDoctor(doctorData);

      // Salva l'ID nel localStorage
      setDemoId('doctor', newDoctor.id);

      // Mostra toast di successo
      showSuccess('Dottore creato con successo! Reindirizzamento...');

      // Reindirizza alla dashboard dopo un breve delay per mostrare il toast
      setTimeout(() => {
        navigate('/doctor/dashboard');
      }, 1000);
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Errore nella creazione del dottore');
      setCreateError(errorMessage);
      showError(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  // Gestione cambio valori con validazione in tempo reale e prefisso +39
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let processedValue = value;

    // Gestione checkbox per esami
    if (name === 'examIds') {
      const examId = value;
      setFormData(prev => {
        const currentIds = prev.examIds || [];
        const newIds = checked 
          ? [...currentIds, examId]
          : currentIds.filter(id => id !== examId);
        return { ...prev, examIds: newIds };
      });
      return;
    }

    // Gestione prefisso +39 per il numero di telefono (usa utility condivisa)
    if (name === 'phoneNumber') {
      processedValue = normalizePhoneNumber(value);
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }));
    
    // Validazione in tempo reale
    validateField(name, processedValue);
  };

  // Schermata iniziale: scelta tra "Accedi" e "Crea nuovo"
  if (mode === null) {
    return (
      <div className="doctor-access-page">
        <div className="access-container">
          <h1>Accesso Dottore</h1>
          <p className="access-subtitle">Scegli come vuoi accedere</p>
          
          <div className="access-options">
            <button 
              className="access-button"
              onClick={() => setMode('select')}
            >
              Accedi
            </button>
            <button 
              className="access-button"
              onClick={() => setMode('create')}
            >
              Crea nuovo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Modalità "Accedi": selettore dottore
  if (mode === 'select') {
    return (
      <div className="doctor-access-page">
        <div className="access-container">
          <h1>Accedi come Dottore</h1>
          
          <button 
            className="back-button"
            onClick={() => setMode(null)}
          >
            ← Cambia modalità
          </button>

          {loadingDoctors && <LoadingSpinner message="Caricamento dottori..." />}
          
          {errorDoctors && !loadingDoctors && (
            <ErrorMessage 
              message={errorDoctors}
              onRetry={loadDoctors}
            />
          )}

          {!loadingDoctors && !errorDoctors && doctors.length > 0 && (
            <div className="select-form">
              <label htmlFor="doctor-select">
                Seleziona un dottore:
              </label>
              <select
                id="doctor-select"
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className={errorDoctors && !selectedDoctorId ? 'error' : ''}
              >
                <option value="">-- Seleziona un dottore --</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.firstName} {doctor.lastName}
                    {doctor.email ? ` (${doctor.email})` : ''}
                  </option>
                ))}
              </select>
              
              <button
                className="submit-button"
                onClick={handleSelectDoctor}
                disabled={!selectedDoctorId}
              >
                Conferma e Accedi
              </button>

              <button 
                className="switch-mode-button"
                onClick={() => setMode('create')}
              >
                Non sei in lista? Crea nuovo dottore
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Modalità "Crea nuovo": form creazione dottore
  return (
    <div className="doctor-access-page">
      <div className="access-container">
        <h1>Crea nuovo Dottore</h1>
        
        <button 
          className="back-button"
          onClick={() => {
            setMode(null);
            setFormData({
              firstName: '',
              lastName: '',
              gender: '',
              email: '',
              phoneNumber: '',
              examIds: [],
            });
            setFormErrors({});
            setCreateError(null);
          }}
        >
          ← Cambia modalità
        </button>

        {createError && (
          <ErrorMessage message={createError} />
        )}

        <form onSubmit={handleCreateDoctor} className="create-form">
          {/* ... campi del form ... */}
          <div className="form-group">
            <label htmlFor="firstName">
              Nome <span className="required">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className={formErrors.firstName ? 'error' : ''}
              required
            />
            {formErrors.firstName && (
              <span className="error-message">{formErrors.firstName}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="lastName">
              Cognome <span className="required">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className={formErrors.lastName ? 'error' : ''}
              required
            />
            {formErrors.lastName && (
              <span className="error-message">{formErrors.lastName}</span>
            )}
          </div>

          <div className="form-group">
            <label>Abilitazione Esami</label>
            <div className="exams-selection-grid">
              {loadingExams ? (
                <p>Caricamento esami...</p>
              ) : availableExams.length > 0 ? (
                availableExams.map(exam => (
                  <label key={exam.id} className="exam-checkbox-label">
                    <input
                      type="checkbox"
                      name="examIds"
                      value={exam.id}
                      checked={formData.examIds.includes(exam.id)}
                      onChange={handleInputChange}
                    />
                    <span className="exam-name">{exam.name}</span>
                  </label>
                ))
              ) : (
                <p>Nessun esame disponibile</p>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="gender">Genere</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
            >
              <option value="">-- Seleziona --</option>
              <option value="M">Maschio</option>
              <option value="F">Femmina</option>
              <option value="Other">Altro</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={formErrors.email ? 'error' : ''}
            />
            {formErrors.email && (
              <span className="error-message">{formErrors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Numero di telefono</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="+39 123 456 7890"
              maxLength={20}
              className={formErrors.phoneNumber ? 'error' : ''}
            />
            {formErrors.phoneNumber && (
              <span className="error-message">{formErrors.phoneNumber}</span>
            )}
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={creating}
          >
            {creating ? 'Creazione in corso...' : 'Crea e Accedi'}
          </button>

          <button 
            type="button"
            className="switch-mode-button"
            onClick={() => setMode('select')}
          >
            Hai già un profilo? Accedi
          </button>
        </form>
      </div>
    </div>
  );
}

export default DoctorAccessPage;
