import { useParams } from 'react-router-dom';

function AppointmentDetailPage() {
  const { id } = useParams();
  
  return (
    <div className="appointment-detail-page">
      <h2>Dettaglio Appuntamento</h2>
      <p>ID: {id}</p>
      <p>Pagina in costruzione</p>
    </div>
  );
}

export default AppointmentDetailPage;
