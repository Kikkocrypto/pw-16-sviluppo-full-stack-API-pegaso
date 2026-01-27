import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getExams } from '../../api/services/exam/examService';
import { getDoctorsByExam } from '../../api/services/doctor/doctorService';
import { createAppointment } from '../../api/services/appointments/appointmentService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useToast } from '../../contexts/ToastContext';
import { getErrorMessage } from '../../utils/errorUtils';
import './BookAppointmentPage.css';

function BookAppointmentPage() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [exams, setExams] = useState([]);
  const [doctors, setDoctors] = useState([]);
  
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [dateError, setDateError] = useState('');
  const [reason, setReason] = useState('');
  const [contraindications, setContraindications] = useState('');

  // Carica esami al montaggio
  useEffect(() => {
    loadExams();
  }, []);

  // Validazione data in tempo reale
  useEffect(() => {
    if (!appointmentDate) {
      setDateError('');
      return;
    }

    const selectedDate = new Date(appointmentDate);
    const now = new Date();
    
    if (selectedDate < now) {
      setDateError('La data non può essere nel passato');
    } else {
      setDateError('');
    }
  }, [appointmentDate]);

  // Carica dottori quando si passa allo step 3 (dopo aver scelto esame e data)
  useEffect(() => {
    if (step === 3 && selectedExam && appointmentDate) {
      loadAvailableDoctors(selectedExam.id, appointmentDate);
    }
  }, [step, selectedExam, appointmentDate]);

  const loadExams = async () => {
    setLoading(true);
    try {
      // Recupera solo gli esami attivi dal server
      const data = await getExams(true);
      setExams(data);
    } catch (err) {
      setError('Impossibile caricare la lista degli esami.');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableDoctors = async (examId, date) => {
    setLoading(true);
    try {
      // Converte la data locale selezionata in un oggetto Date
      const localDate = new Date(date);
      
      // Formatta la data in UTC ISO string per il backend
      const year = localDate.getUTCFullYear();
      const month = String(localDate.getUTCMonth() + 1).padStart(2, '0');
      const day = String(localDate.getUTCDate()).padStart(2, '0');
      const hours = String(localDate.getUTCHours()).padStart(2, '0');
      const minutes = String(localDate.getUTCMinutes()).padStart(2, '0');
      const seconds = '00';
      
      const utcFormattedDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

      const data = await getDoctorsByExam(examId, utcFormattedDate);
      setDoctors(data);
    } catch (err) {
      showError('Impossibile caricare i dottori disponibili.');
    } finally {
      setLoading(false);
    }
  };

  const handleExamSelect = (exam) => {
    setSelectedExam(exam);
    setStep(2);
  };

  const handleDateSubmit = (e) => {
    e.preventDefault();
    if (appointmentDate) {
      setStep(3);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctor) {
      showError('Seleziona un medico per continuare.');
      return;
    }

    setLoading(true);
    try {
      // Converte la data locale selezionata in un oggetto Date
      const localDate = new Date(appointmentDate);
      
      // Formatta la data in UTC ISO string per il backend (senza millisecondi e Z)
      // Il backend si aspetta yyyy-MM-dd'T'HH:mm:ss
      const year = localDate.getUTCFullYear();
      const month = String(localDate.getUTCMonth() + 1).padStart(2, '0');
      const day = String(localDate.getUTCDate()).padStart(2, '0');
      const hours = String(localDate.getUTCHours()).padStart(2, '0');
      const minutes = String(localDate.getUTCMinutes()).padStart(2, '0');
      const seconds = '00';
      
      const utcFormattedDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

      await createAppointment({
        doctorId: selectedDoctor.id,
        examId: selectedExam.id,
        appointmentDate: utcFormattedDate,
        reason: reason,
        contraindications: contraindications
      });
      showSuccess('Appuntamento prenotato con successo!');
      setStep(4);
    } catch (err) {
      // Usiamo bypassSensitivity = true perché qui l'errore 409 (conflitto orario) 
      const message = getErrorMessage(err, 'Errore durante la prenotazione. Riprova.', true);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 4) {
    return (
      <div className="book-appointment">
        <div className="booking-container success-container">
          <span className="success-icon">✅</span>
          <h1>Prenotazione Completata!</h1>
          <p>La tua richiesta è stata inviata. Riceverai una conferma a breve.</p>
          <div className="success-actions">
            <Link to="/patient/dashboard" className="btn-primary">
              Vai alla Dashboard
            </Link>
            <Link to="/patient/appointments" className="btn-secondary">
              Vedi i miei appuntamenti
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="book-appointment">
      <header className="book-header">
        <h1>Prenota una Visita</h1>
        <Link to="/patient/dashboard" className="btn-back">
          Annulla
        </Link>
      </header>

      <div className="booking-container">
        {loading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} onRetry={loadExams} />}

        {!loading && !error && (
          <>
            {/* Riepilogo scelta (visibile dal passo 2) */}
            {step > 1 && step < 4 && selectedExam && (
              <div className="booking-summary-mini">
                <span>Stai prenotando: <strong>{selectedExam.name}</strong></span>
                <button className="btn-link" onClick={() => setStep(1)}>Cambia</button>
              </div>
            )}

            {step === 1 && (
              <div className="booking-step">
                <h2>1. Seleziona l'esame</h2>
                <div className="selection-grid">
                  {exams.map(exam => (
                    <div 
                      key={exam.id} 
                      className={`selection-card ${selectedExam?.id === exam.id ? 'selected' : ''}`}
                      onClick={() => handleExamSelect(exam)}
                    >
                      <h3>{exam.name}</h3>
                      <p>{exam.description || 'Nessuna descrizione disponibile'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="booking-step">
                <h2>2. Scegli Data e Ora</h2>
                <form onSubmit={handleDateSubmit} className="date-selection-form">
                  <div className="calendar-card">
                    <div className="calendar-icon-large">📅</div>
                    <div className="form-group">
                      <label htmlFor="appointment-date">Quando vorresti effettuare la visita?</label>
                      <input 
                        id="appointment-date"
                        type="datetime-local" 
                        required 
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        className={`modern-datetime-input ${dateError ? 'error' : ''}`}
                        min={(() => {
                          const now = new Date();
                          const offset = now.getTimezoneOffset() * 60000;
                          const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, 16);
                          return localISOTime;
                        })()}
                      />
                      {dateError && (
                        <span className="error-message centered">
                          {dateError}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="booking-actions">
                    <button type="button" onClick={() => setStep(1)} className="btn-back">Indietro</button>
                    <button 
                      type="submit" 
                      className="submit-button" 
                      disabled={!!dateError || !appointmentDate}
                    >
                      Cerca Medici Disponibili
                    </button>
                  </div>
                </form>
              </div>
            )}

            {step === 3 && (
              <div className="booking-step">
                <h2>3. Seleziona Medico e Dettagli</h2>
                <div className="date-summary-badge">
                  📅 {new Date(appointmentDate).toLocaleString('it-IT', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Scegli il medico</label>
                    <div className="selection-grid">
                      {doctors.length > 0 ? (
                        doctors.map(doctor => (
                          <div 
                            key={doctor.id} 
                            className={`selection-card ${selectedDoctor?.id === doctor.id ? 'selected' : ''}`}
                            onClick={() => setSelectedDoctor(doctor)}
                          >
                            <h3>
                              {doctor.gender === 'F' ? 'Dott.ssa' : 'Dott.'} {doctor.firstName} {doctor.lastName}
                            </h3>
                          </div>
                        ))
                      ) : (
                        <p>Nessun medico disponibile per questo esame in questa data.</p>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Motivo della visita (opzionale)</label>
                    <textarea 
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Descrivi brevemente il motivo della visita..."
                      rows="2"
                    />
                  </div>

                  <div className="form-group">
                    <label>Controindicazioni (opzionale)</label>
                    <textarea 
                      value={contraindications}
                      onChange={(e) => setContraindications(e.target.value)}
                      placeholder="Segnala eventuali allergie o problemi..."
                      rows="2"
                    />
                  </div>

                  <div className="booking-actions">
                    <button type="button" onClick={() => setStep(2)} className="btn-back">Indietro</button>
                    <button type="submit" className="submit-button" disabled={loading || !selectedDoctor}>
                      Conferma Prenotazione
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default BookAppointmentPage;
