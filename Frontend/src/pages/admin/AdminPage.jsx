import { Link } from 'react-router-dom';
import './AdminPage.css';

function AdminPage() {
  return (
    <div className="admin-page">
      <h2>Gestione Sistema</h2>
      <div className="admin-menu">
        <Link to="/admin/patients" className="admin-card">
          <h3>Pazienti</h3>
          <p>Gestisci i pazienti registrati</p>
        </Link>
        <Link to="/admin/doctors" className="admin-card">
          <h3>Dottori</h3>
          <p>Gestisci i dottori registrati</p>
        </Link>
        <Link to="/admin/appointments" className="admin-card">
          <h3>Prenotazioni</h3>
          <p>Visualizza e gestisci tutte le prenotazioni</p>
        </Link>
        <Link to="/admin/exams" className="admin-card">
          <h3>Esami</h3>
          <p>Gestisci il catalogo esami</p>
        </Link>
      </div>
    </div>
  );
}

export default AdminPage;
