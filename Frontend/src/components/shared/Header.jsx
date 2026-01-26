import { Link, useLocation } from 'react-router-dom';
import { getDemoId, clearDemoHeaders } from '../../api/demoHeaders';
import './Header.css';

function Header() {
  const location = useLocation();
  const patientId = getDemoId('patient');
  const doctorId = getDemoId('doctor');
  const adminId = getDemoId('admin');

  const handleLogout = () => {
    clearDemoHeaders();
    window.location.href = '/';
  };

  const getIdentityText = () => {
    if (patientId) return 'Paziente';
    if (doctorId) return 'Dottore';
    if (adminId) return 'Admin';
    return null;
  };

  const identityText = getIdentityText();
  const showBackButton = location.pathname !== '/' && location.pathname !== '/home';

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          {showBackButton && (
            <Link to="/" className="back-button">
              ← Home
            </Link>
          )}
          <Link to="/" className="logo">
            <h1>Private Healthcare</h1>
          </Link>
        </div>
        
        <div className="header-right">
          {identityText && (
            <div className="identity-banner">
              <span>Sei connesso come: <strong>{identityText}</strong></span>
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
