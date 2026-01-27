import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDoctorProfile, updateDoctorProfile, deleteDoctorProfile } from '../../api/services/doctor/doctorService';
import { clearDemoHeaders } from '../../api/demoHeaders';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';
import { getErrorMessage } from '../../utils/errorUtils';
import { validateField as validateFieldUtil, validateDoctorForm } from '../../utils/validation';
import { normalizePhoneNumber, ensurePhonePrefix } from '../../utils/phoneUtils';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import './DoctorProfilePage.css';

function DoctorProfilePage() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [initialData, setInitialData] = useState(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    gender: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const profile = await getDoctorProfile();
      const data = {
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phoneNumber: profile.phoneNumber || '',
        gender: profile.gender || ''
      };
      setFormData(data);
      setInitialData(data);
    } catch (err) {
      showError(getErrorMessage(err, 'Errore nel caricamento del profilo'));
    } finally {
      setLoading(false);
    }
  };

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === 'phoneNumber') {
      processedValue = normalizePhoneNumber(value);
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }));
    validateField(name, processedValue);
  };

  const isFormChanged = () => {
    if (!initialData) return false;
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  };

  const isFormValid = () => {
    return (
      formData.firstName.trim() !== '' &&
      formData.lastName.trim() !== '' &&
      formData.email.trim() !== '' &&
      Object.keys(formErrors).length === 0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateDoctorForm(formData);
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      showError('Per favore, correggi gli errori nel modulo prima di salvare.');
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        ...formData,
        phoneNumber: ensurePhonePrefix(formData.phoneNumber)
      };
      await updateDoctorProfile(updateData);
      showSuccess('Profilo aggiornato con successo');
    } catch (err) {
      showError(getErrorMessage(err, 'Errore durante l\'aggiornamento'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProfile = async () => {
    try {
      await deleteDoctorProfile();
      showSuccess('Account eliminato con successo');
      clearDemoHeaders();
      navigate('/');
    } catch (err) {
      showError(getErrorMessage(err, 'Errore durante l\'eliminazione dell\'account'));
    }
  };

  if (loading) return <LoadingSpinner message="Caricamento profilo..." />;

  return (
    <div className="doctor-profile-page">
      <button className="back-button" onClick={() => navigate('/doctor/dashboard')}>
        ← Torna alla Dashboard
      </button>
      <div className="profile-container">
        <header className="profile-header">
          <h1>Il mio Profilo</h1>
          <p>Gestisci i tuoi dati professionali e le impostazioni dell'account</p>
        </header>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-section">
            <h2>Informazioni Professionali</h2>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="firstName">Nome <span className="required">*</span></label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={formErrors.firstName ? 'error' : ''}
                  required
                />
                {formErrors.firstName && <span className="error-message">{formErrors.firstName}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Cognome <span className="required">*</span></label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={formErrors.lastName ? 'error' : ''}
                  required
                />
                {formErrors.lastName && <span className="error-message">{formErrors.lastName}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="gender">Genere</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Seleziona...</option>
                  <option value="M">Maschio</option>
                  <option value="F">Femmina</option>
                  <option value="Other">Altro</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Contatti</h2>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="email">Email <span className="required">*</span></label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={formErrors.email ? 'error' : ''}
                  required
                />
                {formErrors.email && <span className="error-message">{formErrors.email}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="phoneNumber">Telefono</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+39 123 456 7890"
                  maxLength={20}
                  className={formErrors.phoneNumber ? 'error' : ''}
                />
                {formErrors.phoneNumber && <span className="error-message">{formErrors.phoneNumber}</span>}
              </div>
            </div>
          </div>

          <div className="profile-actions">
            <button 
              type="submit" 
              className="submit-button" 
              disabled={saving || !isFormChanged() || !isFormValid()}
            >
              {saving ? 'Salvataggio...' : 'Salva Modifiche'}
            </button>
          </div>
        </form>

        <div className="danger-zone">
          <h2>Zona Pericolosa</h2>
          <p>L'eliminazione dell'account è irreversibile. Tutti i tuoi dati e le tue visite verranno rimosse.</p>
          <button 
            type="button" 
            className="delete-account-button"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Elimina Account
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Elimina Account"
        message="Sei sicuro di voler eliminare definitivamente il tuo account? Questa operazione non può essere annullata."
        onConfirm={handleDeleteProfile}
        onCancel={() => setShowDeleteConfirm(false)}
        confirmLabel="Sì, elimina definitivamente"
        cancelLabel="Annulla"
      />
    </div>
  );
}

export default DoctorProfilePage;
