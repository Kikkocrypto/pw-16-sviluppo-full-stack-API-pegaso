// Pagina di accesso demo per dottori

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDoctors, createDoctor } from '../../api/services/doctor/doctorService';
import { setDemoId } from '../../api/demoHeaders';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import './DoctorAccessPage.css';

function DoctorAccessPage() {
  const navigate = useNavigate();
  
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
    specialization: '',
    gender: '',
    email: '',
    phoneNumber: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);


  useEffect(() => {
    if (mode === 'select') {
      loadDoctors();
    }
  }, [mode]);

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
      setErrorDoctors(error?.message || 'Errore nel caricamento dei dottori');
    } finally {
      setLoadingDoctors(false);
    }
  };
// Selezione dottore
  const handleSelectDoctor = () => {
    if (!selectedDoctorId) {
      setErrorDoctors('Seleziona un dottore dalla lista');
      return;
    }

    // Salva l'ID nel localStorage
    setDemoId('doctor', selectedDoctorId);

    navigate('/doctor/dashboard');
  };

// Validazione form creazione dottore
  const validateForm = () => {
    const errors = {};

    // Validazione campi obbligatori
    if (!formData.firstName.trim()) {
      errors.firstName = 'Il nome è obbligatorio';
    }
    if (!formData.lastName.trim()) {
      errors.lastName = 'Il cognome è obbligatorio';
    }

    // Validazione formato emai
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Formato email non valido';
      }
    }

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
      const doctorData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        specialization: formData.specialization.trim() || null,
        gender: formData.gender || null,
        email: formData.email.trim() || null,
        phoneNumber: formData.phoneNumber.trim() || null,
        examIds: null, // Per ora non gestiamo la selezione esami nella creazione
      };

      const newDoctor = await createDoctor(doctorData);

      // Salva l'ID nel localStorage
      setDemoId('doctor', newDoctor.id);

      // Reindirizza alla dashboard
      navigate('/doctor/dashboard');
    } catch (error) {
      setCreateError(error?.message || 'Errore nella creazione del dottore');
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
            ← Indietro
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
                    {doctor.specialization ? ` - ${doctor.specialization}` : ''}
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
              specialization: '',
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

        <form onSubmit={handleCreateDoctor} className="create-form">
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
            <label htmlFor="specialization">Specializzazione</label>
            <input
              type="text"
              id="specialization"
              name="specialization"
              value={formData.specialization}
              onChange={handleInputChange}
              placeholder="Es. Cardiologia, Pediatria..."
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

export default DoctorAccessPage;
