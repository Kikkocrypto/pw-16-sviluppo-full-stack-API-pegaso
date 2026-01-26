import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/apiClient';
import { setDemoId } from '../../api/demoHeaders';
import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();
  const [healthStatus, setHealthStatus] = useState(null);
  const [error, setError] = useState(null);
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    setApiUrl(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api');
    checkBackendHealth();
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
