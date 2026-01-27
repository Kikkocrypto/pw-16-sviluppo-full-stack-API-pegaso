import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/apiClient';
import { setDemoId, getDemoId } from '../../api/demoHeaders';
import { IconCalendar, IconDoctor, IconSettings } from '../../components/common/Icons';
import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();
  const [healthStatus, setHealthStatus] = useState(null);
  const [error, setError] = useState(null);
  const [patientId, setPatientId] = useState(getDemoId('patient'));
  const [doctorId, setDoctorId] = useState(getDemoId('doctor'));
  const [adminId, setAdminId] = useState(getDemoId('admin'));

  useEffect(() => {
    checkBackendHealth();
    
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
        setError('Servizio temporaneamente non disponibile');
      }
    } catch (err) {
      setHealthStatus('error');
      setError('Connessione al server fallita');
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
      <header className="hero-section">
        <h1>Benvenuto in Dottori & Dolori</h1>
        <p>La tua salute, semplificata. Prenota visite ed esami in pochi click.</p>
      </header>

      <div className="status-bar">
        <span>Stato del sistema:</span>
        <div className={`status-indicator ${healthStatus}`}>
          {healthStatus === 'connected' && 'Operativo'}
          {healthStatus === 'error' && error}
          {!healthStatus && 'Verifica in corso...'}
        </div>
      </div>

      <div className="home-menu">
        {patientId && (
          <Link to="/patient/dashboard" className="home-card dashboard-card">
            <div className="card-icon"><IconCalendar size={32} color="var(--primary-color)" /></div>
            <div className="card-content">
              <h3>Area Paziente</h3>
              <p>Bentornato! Visualizza i tuoi appuntamenti e i referti degli esami.</p>
            </div>
          </Link>
        )}

        {doctorId && (
          <Link to="/doctor/dashboard" className="home-card dashboard-card">
            <div className="card-icon"><IconDoctor size={32} color="var(--secondary-color)" /></div>
            <div className="card-content">
              <h3>Area Medico</h3>
              <p>Gestisci la tua agenda, consulta le prenotazioni e i profili dei pazienti.</p>
            </div>
          </Link>
        )}

        {adminId && (
          <Link to="/admin" className="home-card dashboard-card">
            <div className="card-icon"><IconSettings size={32} color="var(--text-muted)" /></div>
            <div className="card-content">
              <h3>Pannello Amministratore</h3>
              <p>Gestione completa di pazienti, medici, esami e configurazioni di sistema.</p>
            </div>
          </Link>
        )}

        {!patientId && (
          <Link to="/patient" className="home-card">
            <h3>Paziente</h3>
            <p>Accedi per prenotare una visita o consultare i tuoi appuntamenti.</p>
          </Link>
        )}
        
        {!doctorId && (
          <Link to="/doctor" className="home-card">
            <h3>Personale Medico</h3>
            <p>Area riservata ai medici per la gestione delle attività cliniche.</p>
          </Link>
        )}
        
        {!adminId && (
          <a href="/admin" onClick={handleAdminAccess} className="home-card">
            <h3>Amministrazione</h3>
            <p>Accesso riservato alla gestione del portale e delle anagrafiche.</p>
          </a>
        )}
      </div>
    </div>
  );
}

export default HomePage;
