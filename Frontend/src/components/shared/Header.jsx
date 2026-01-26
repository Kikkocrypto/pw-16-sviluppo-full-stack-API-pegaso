import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getDemoId, clearDemoHeaders } from '../../api/demoHeaders';
import './Header.css';

function Header() {
  const location = useLocation();
  const [patientId, setPatientId] = useState(getDemoId('patient'));
  const [doctorId, setDoctorId] = useState(getDemoId('doctor'));
  const [adminId, setAdminId] = useState(getDemoId('admin'));

  // Funzione per aggiornare i ruoli dal localStorage
  const updateRoles = useCallback(() => {
    setPatientId(getDemoId('patient'));
    setDoctorId(getDemoId('doctor'));
    setAdminId(getDemoId('admin'));
  }, []);

  // Aggiorna lo stato quando cambia la route
  useEffect(() => {
    updateRoles();
  }, [location.pathname, updateRoles]);

  // Ascolta gli eventi di cambiamento del ruolo
  useEffect(() => {
    // Ascolta gli eventi di cambiamento del localStorage (da altre finestre/tab)
    const handleStorageChange = () => {
      updateRoles();
    };

    // Ascolta l'evento custom per i cambiamenti di ruolo
    const handleRoleChange = () => {
      updateRoles();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('demoRoleChanged', handleRoleChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('demoRoleChanged', handleRoleChange);
    };
  }, [updateRoles]);

  // Polling periodico come fallback per assicurarsi che il ruolo sia sempre aggiornato
  // Questo è utile quando gli eventi non vengono catturati correttamente
  useEffect(() => {
    const interval = setInterval(() => {
      updateRoles();
    }, 1000); // Controlla ogni secondo

    return () => clearInterval(interval);
  }, [updateRoles]);

  const handleLogout = () => {
    clearDemoHeaders();
    window.location.href = '/';
  };

  const getIdentityText = () => {
    if (adminId) return 'admin';
    if (patientId) return 'paziente';
    if (doctorId) return 'dottore';
    return null;
  };

  const identityText = getIdentityText();
  const showBackButton = location.pathname !== '/' && location.pathname !== '/home';

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <Link to="/" className="logo">
            <h1>Private Healthcare</h1>
          </Link>
          {identityText && (
            <Link to="/" className="home-link">
              Torna alla Home
            </Link>
          )}
        </div>
        
        <div className="header-right">
          {identityText && (
            <div className="identity-section">
              <div className="identity-banner">
                <span className="identity-label">Sei connesso come: </span>
                <strong>{identityText}</strong>
              </div>
            </div>
          )}
          {(patientId || doctorId || adminId) && (
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
