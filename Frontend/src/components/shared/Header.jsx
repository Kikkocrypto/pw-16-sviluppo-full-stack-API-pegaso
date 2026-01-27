import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getDemoId, clearDemoHeaders } from '../../api/demoHeaders';
import { IconUser, IconHome } from '../common/Icons';
import './Header.css';

function Header() {
  const location = useLocation();
  const [patientId, setPatientId] = useState(getDemoId('patient'));
  const [doctorId, setDoctorId] = useState(getDemoId('doctor'));
  const [adminId, setAdminId] = useState(getDemoId('admin'));
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Funzione per aggiornare i ruoli dal localStorage
  const updateRoles = useCallback(() => {
    setPatientId(getDemoId('patient'));
    setDoctorId(getDemoId('doctor'));
    setAdminId(getDemoId('admin'));
  }, []);

  // Aggiorna lo stato quando cambia la route
  useEffect(() => {
    updateRoles();
    setIsMenuOpen(false); // Chiudi il menu al cambio pagina
  }, [location.pathname, updateRoles]);

  // Chiudi il menu se si clicca fuori
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMenuOpen && !e.target.closest('.header-right')) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

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
    setIsMenuOpen(false);
    window.location.href = '/';
  };

  const getIdentityText = () => {
    if (adminId) return 'admin';
    if (patientId) return 'paziente';
    if (doctorId) return 'dottore';
    return null;
  };

  const getProfileLink = () => {
    if (adminId) return '/admin';
    if (doctorId) return '/doctor/profile';
    if (patientId) return '/patient/profile';
    return null;
  };

  const identityText = getIdentityText();
  const profileLink = getProfileLink();
  const showBackButton = location.pathname !== '/' && location.pathname !== '/home';

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
            <Link to="/" className="logo">
              <h1>Dottori & Dolori</h1>
            </Link>
            {identityText && (
              <Link to="/" className="home-link desktop-only">
                Dashboard
              </Link>
            )}
        </div>
        
        <div className="header-right">
          {identityText && (
            <>
              <button 
                className="hamburger-button" 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Menu"
              >
                <span className={`hamburger-icon ${isMenuOpen ? 'open' : ''}`}></span>
              </button>

              <div className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
                <div className="identity-section">
                  <div className="identity-banner">
                    <span className="identity-label">Sei connesso come: </span>
                    <strong>{identityText}</strong>
                  </div>
                </div>
                
                <Link to="/" className="mobile-home-link mobile-only">
                  <IconHome size={18} /> Torna alla Home
                </Link>

                {profileLink && (
                  <Link to={profileLink} className="profile-link">
                    <IconUser size={18} />
                    <span className="profile-text">Il mio Profilo</span>
                  </Link>
                )}

                {(patientId || doctorId || adminId) && (
                  <button onClick={handleLogout} className="logout-button">
                    Logout
                  </button>
                )}
              </div>
            </>
          )}
          
          {!identityText && (patientId || doctorId || adminId) && (
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
