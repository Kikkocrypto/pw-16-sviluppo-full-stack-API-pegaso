import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExamDetail } from '../../api/services/exam/examService';
import { LoadingSpinner, ErrorMessage } from '../../components/common';
import { IconClock, IconCheck, IconX } from '../../components/common/Icons';
import './ExamDetailPage.css';

function ExamDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExamDetail();
  }, [id]);

  const fetchExamDetail = async () => {
    try {
      setLoading(true);
      const data = await getExamDetail(id);
      setExam(data);
      setError(null);
    } catch (err) {
      setError('Impossibile caricare i dettagli dell\'esame.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Caricamento dettagli esame..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchExamDetail} />;
  if (!exam) return <ErrorMessage message="Esame non trovato." />;

  return (
    <div className="exam-detail-container">
      <header className="exam-detail-header">
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Indietro
        </button>
        <h1>Dettaglio Esame</h1>
      </header>

      <div className="exam-detail-card">
        <h2>{exam.name}</h2>
        
        <div className="exam-info-grid">
          <div className="info-item">
            <label>Durata Stimata</label>
            <span><IconClock size={18} /> {exam.durationMinutes} minuti</span>
          </div>
          <div className="info-item">
            <label>Stato Catalogo</label>
            <span>
              {exam.isActive ? (
                <span style={{ color: 'var(--success-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <IconCheck size={18} /> Attivo
                </span>
              ) : (
                <span style={{ color: 'var(--error-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <IconX size={18} /> Inattivo
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="description-section">
          <h3>Descrizione Prestazione</h3>
          <p>{exam.description || 'Nessuna descrizione disponibile per questo esame.'}</p>
        </div>
      </div>
    </div>
  );
}

export default ExamDetailPage;
