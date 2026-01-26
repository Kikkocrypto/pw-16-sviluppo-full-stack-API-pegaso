import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPatients, createPatient } from '../../api/services/patient/patientService';
import { setDemoId } from '../../api/demoHeaders';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import './PatientAccessPage.css';


// Pagina di accesso demo per pazienti
function PatientAccessPage() {
  const navigate = useNavigate();
  
  // Modalità: 'select' per selezione utente esistente, 'create' per creazione nuovo
  const [mode, setMode] = useState(null);
  
  // Stato per la modalità "Accedi"
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [errorPatients, setErrorPatients] = useState(null);
  
  // Stato per la modalità "Crea nuovo"
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    phoneNumber: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

// Carica la lista dei pazienti quando si entra in modalità "Accedi"
  useEffect(() => {
    if (mode === 'select') {
      loadPatients();
    }
  }, [mode]);

// Carica la lista dei pazienti dal backend
  const loadPatients = async () => {
    setLoadingPatients(true);
    setErrorPatients(null);
    try {
      const data = await getPatients(10);
      setPatients(data);
      if (data.length === 0) {
        setErrorPatients('Nessun paziente trovato. Crea un nuovo paziente per iniziare.');
      }
    } catch (error) {
      setErrorPatients(error?.message || 'Errore nel caricamento dei pazienti');
    } finally {
      setLoadingPatients(false);
    }
  };

// Gestisce la selezione di un paziente esistente
  const handleSelectPatient = () => {
    if (!selectedPatientId) {
      setErrorPatients('Seleziona un paziente dalla lista');
      return;
    }

    // Salva l'ID nel localStorage (Demo header del paziente selezionato)
    setDemoId('patient', selectedPatientId);
    navigate('/patient/dashboard');
  };

  // Validazione form creazione paziente
  const validateForm = () => {
    const errors = {};

    // Validazione campi obbligatori
    if (!formData.firstName.trim()) {
      errors.firstName = 'Il nome è obbligatorio';
    }
    if (!formData.lastName.trim()) {
      errors.lastName = 'Il cognome è obbligatorio';
    }

    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Formato email non valido';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

// Creazione paziente
  const handleCreatePatient = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setCreating(true);
    setCreateError(null);

    try {
      // Prepara i dati per l'API (rimuove campi vuoti)
      const patientData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dateOfBirth: formData.dateOfBirth || null,
        gender: formData.gender || null,
        email: formData.email.trim() || null,
        phoneNumber: formData.phoneNumber.trim() || null,
      };

      const newPatient = await createPatient(patientData);

      // Salva l'ID nel localStorage
      setDemoId('patient', newPatient.id);

      // Reindirizza alla dashboard
      navigate('/patient/dashboard');
    } catch (error) {
      setCreateError(error?.message || 'Errore nella creazione del paziente');
    } finally {
      setCreating(false);
    }
  };

// Cambio dei valori dei campi del form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Rimuove l'errore del campo quando l'utente inizia a digitare
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Schermata iniziale: scelta tra "Accedi" e "Crea nuovo"
  if (mode === null) {
    return (
      <div className="patient-access-page">
        <div className="access-container">
          <h1>Accesso Paziente</h1>
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

  // Modalità "Accedi": selettore paziente
  if (mode === 'select') {
    return (
      <div className="patient-access-page">
        <div className="access-container">
          <h1>Accedi come Paziente</h1>
          
          <button 
            className="back-button"
            onClick={() => setMode(null)}
          >
            ← Indietro
          </button>

          {loadingPatients && <LoadingSpinner message="Caricamento pazienti..." />}
          
          {errorPatients && !loadingPatients && (
            <ErrorMessage 
              message={errorPatients}
              onRetry={loadPatients}
            />
          )}

          {!loadingPatients && !errorPatients && patients.length > 0 && (
            <div className="select-form">
              <label htmlFor="patient-select">
                Seleziona un paziente:
              </label>
              <select
                id="patient-select"
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className={errorPatients && !selectedPatientId ? 'error' : ''}
              >
                <option value="">-- Seleziona un paziente --</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.firstName} {patient.lastName}
                    {patient.email ? ` (${patient.email})` : ''}
                  </option>
                ))}
              </select>
              
              <button
                className="submit-button"
                onClick={handleSelectPatient}
                disabled={!selectedPatientId}
              >
                Conferma e Accedi
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Modalità "Crea nuovo": form creazione paziente
  return (
    <div className="patient-access-page">
      <div className="access-container">
        <h1>Crea nuovo Paziente</h1>
        
        <button 
          className="back-button"
          onClick={() => {
            setMode(null);
            setFormData({
              firstName: '',
              lastName: '',
              dateOfBirth: '',
              gender: '',
              email: '',
              phoneNumber: '',
            });
            setFormErrors({});
            setCreateError(null);
          }}
        >
          ← Indietro
        </button>

        {createError && (
          <ErrorMessage message={createError} />
        )}

        <form onSubmit={handleCreatePatient} className="create-form">
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
            <label htmlFor="dateOfBirth">Data di nascita</label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
            />
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
            />
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={creating}
          >
            {creating ? 'Creazione in corso...' : 'Crea e Accedi'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PatientAccessPage;
