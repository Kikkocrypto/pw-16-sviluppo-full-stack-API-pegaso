import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/apiClient';
import { setDemoId, getDemoId } from '../../api/demoHeaders';
import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();
  const [healthStatus, setHealthStatus] = useState(null);
  const [error, setError] = useState(null);
  const [apiUrl, setApiUrl] = useState('');
  const [patientId, setPatientId] = useState(getDemoId('patient'));
  const [doctorId, setDoctorId] = useState(getDemoId('doctor'));
  const [adminId, setAdminId] = useState(getDemoId('admin'));

  useEffect(() => {
    setApiUrl(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api');
    checkBackendHealth();
    
    // Aggiorna gli ID se cambiano
    const handleRoleChange = () => {
      setPatientId(getDemoId('patient'));
      setDoctorId(getDemoId('doctor'));
      setAdminId(getDemoId('admin'));
    };
    window.addEventListener('demoRoleChanged', handleRoleChange);
    return () => window.removeEventListener('demoRoleChanged', handleRoleChange);
  }, []);

  const checkBackendHealth = async () => {
    try {
      const data = await api.get('/health');
      if (data && data.status === 'UP') {
        setHealthStatus('connected');
      } else {
        setHealthStatus('error');
        setError('Backend non raggiungibile');
      }
    } catch (err) {
      setHealthStatus('error');
      setError('Impossibile connettersi al backend. Verifica che il backend sia avviato.');
      console.error('Health check error:', err);
    }
  };

  const handleAdminAccess = (e) => {
    e.preventDefault();
    setDemoId('admin', '880e8400-e29b-41d4-a716-446655440001');
    navigate('/admin');
  };

  return (
    <div className="home-page">
      <div className="status-card">
        <h2>Stato Connessione</h2>
        <div className="status-info">
          <p><strong>Backend URL:</strong> {apiUrl}</p>
          <div className={`status-indicator ${healthStatus}`}>
            {healthStatus === 'connected' && '✓ Connesso'}
            {healthStatus === 'error' && '✗ Errore di connessione'}
            {!healthStatus && '⏳ Controllo in corso...'}
          </div>
          {error && <p className="error-message">{error}</p>}
        </div>
      </div>

      <div className="home-menu">
        {patientId && (
          <Link to="/patient/dashboard" className="home-card dashboard-card patient">
            <div className="card-icon">📅</div>
            <div className="card-content">
              <h3>Vai alle tue prenotazioni</h3>
              <p>Visualizza e gestisci i tuoi appuntamenti come paziente</p>
            </div>
          </Link>
        )}

        {doctorId && (
          <Link to="/doctor/dashboard" className="home-card dashboard-card doctor">
            <div className="card-icon">👨‍⚕️</div>
            <div className="card-content">
              <h3>Vai alla tua agenda</h3>
              <p>Gestisci i tuoi appuntamenti e la tua disponibilità</p>
            </div>
          </Link>
        )}

        {adminId && (
          <Link to="/admin" className="home-card dashboard-card admin">
            <div className="card-icon">⚙️</div>
            <div className="card-content">
              <h3>Vai al pannello admin</h3>
              <p>Gestisci l'intero sistema, utenti ed esami</p>
            </div>
          </Link>
        )}

        <Link to="/patient" className="home-card">
          <h3>Prenota ora</h3>
          <p>Accedi come paziente o crea un nuovo profilo per prenotare un appuntamento</p>
        </Link>
        
        <Link to="/doctor" className="home-card">
          <h3>Accedi da dottore</h3>
          <p>Accedi come dottore o crea un nuovo profilo per gestire le prenotazioni</p>
        </Link>
        
        <a href="/admin" onClick={handleAdminAccess} className="home-card">
          <h3>Gestione sistema</h3>
          <p>Accedi all'area amministrativa per gestire pazienti, dottori, prenotazioni ed esami</p>
        </a>
      </div>
    </div>
  );
}

export default HomePage;
