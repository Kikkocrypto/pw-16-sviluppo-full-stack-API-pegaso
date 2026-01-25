import { useState, useEffect } from 'react'
import { api } from '../api/apiClient'
import './HomePage.css'

function HomePage() {
  const [healthStatus, setHealthStatus] = useState(null);
  const [error, setError] = useState(null);
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    // Mostra l'URL dell'API configurato
    // Nota: Il browser usa localhost:8080 (porta esposta), non backend:8080
    setApiUrl(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api');
    
    // Test di connessione al backend
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      // Usa l'API client per chiamare l'endpoint di health check
      // L'endpoint è /api/health, quindi usiamo /health come endpoint relativo
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

      <div className="info-card">
        <h2>Informazioni</h2>
        <p>Questa è la pagina principale dell'applicazione React.</p>
        <p>Il frontend è configurato per comunicare con il backend tramite la variabile d'ambiente <code>VITE_API_BASE_URL</code>.</p>
        <p>Per utilizzare l'applicazione, implementa le pagine per:</p>
        <ul>
          <li>Gestione Pazienti</li>
          <li>Gestione Dottori</li>
          <li>Gestione Appuntamenti</li>
          <li>Area Admin</li>
        </ul>
      </div>
    </div>
  );
}

export default HomePage;
