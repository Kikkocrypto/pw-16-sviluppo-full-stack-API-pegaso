import { useParams } from 'react-router-dom';

function ExamDetailPage() {
  const { id } = useParams();
  
  return (
    <div className="exam-detail-page">
      <h2>Dettaglio Esame</h2>
      <p>ID: {id}</p>
      <p>Pagina in costruzione</p>
    </div>
  );
}

export default ExamDetailPage;
