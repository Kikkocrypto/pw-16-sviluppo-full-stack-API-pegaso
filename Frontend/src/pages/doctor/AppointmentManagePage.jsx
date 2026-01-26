import { useParams } from 'react-router-dom';

function AppointmentManagePage() {
  const { id } = useParams();
  
  return (
    <div className="appointment-manage-page">
      <h2>Gestione Appuntamento</h2>
      <p>ID: {id}</p>
      <p>Pagina in costruzione</p>
    </div>
  );
}

export default AppointmentManagePage;
