import React, { useState, useEffect } from 'react';
import { getExams } from '../../api/services/exam/examService';
import { getDoctors } from '../../api/services/doctor/doctorService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import './HomePage.css'; // Riutilizziamo alcuni stili comuni

function ExamListPage() {
  const [exams, setExams] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Recuperiamo sia gli esami che i dottori per poter mostrare le associazioni
        const [examsData, doctorsData] = await Promise.all([
          getExams(),
          getDoctors(100) // Prendiamo un numero sufficiente di dottori
        ]);
        
        // Filtriamo solo gli esami attivi
        setExams(examsData.filter(e => e.isActive));
        setDoctors(doctorsData);
        setError(null);
      } catch (err) {
        setError('Errore nel caricamento della lista esami. Riprova più tardi.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper per trovare i dottori associati a un esame
  const getDoctorsForExam = (examId) => {
    return doctors.filter(doctor => 
      doctor.exams && doctor.exams.some(e => e.examId === examId)
    );
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="exam-list-page container">
      <div className="page-header">
        <h1>Catalogo Esami</h1>
        <p className="subtitle">Visualizza tutti gli esami disponibili e i medici specialisti associati.</p>
      </div>

      {exams.length === 0 ? (
        <EmptyState 
          title="Nessun esame disponibile" 
          message="Al momento non ci sono esami attivi nel catalogo." 
        />
      ) : (
        <div className="exams-grid">
          {exams.map(exam => {
            const associatedDoctors = getDoctorsForExam(exam.id);
            
            return (
              <div key={exam.id} className="exam-card">
                <div className="exam-card-header">
                  <h3>{exam.name}</h3>
                  <span className="duration-badge">{exam.durationMinutes} min</span>
                </div>
                <div className="exam-card-body">
                  <p className="exam-description">{exam.description || 'Nessuna descrizione disponibile.'}</p>
                  
                  <div className="associated-doctors">
                    <h4>Medici specialisti:</h4>
                    {associatedDoctors.length > 0 ? (
                      <ul className="doctor-mini-list">
                        {associatedDoctors.map(doc => (
                          <li key={doc.id}>
                            Dr. {doc.firstName} {doc.lastName}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="no-doctors">Nessun medico attualmente associato a questo esame.</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .exam-list-page {
          padding: 2rem 1rem;
        }
        .page-header {
          margin-bottom: 2rem;
          text-align: center;
        }
        .subtitle {
          color: #666;
          font-size: 1.1rem;
        }
        .exams-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 2rem;
        }
        .exam-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform 0.2s;
        }
        .exam-card:hover {
          transform: translateY(-4px);
        }
        .exam-card-header {
          padding: 1.5rem;
          background: #f8f9fa;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .exam-card-header h3 {
          margin: 0;
          color: #2c3e50;
        }
        .duration-badge {
          background: #e1f5fe;
          color: #0288d1;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .exam-card-body {
          padding: 1.5rem;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }
        .exam-description {
          color: #555;
          margin-bottom: 1.5rem;
          line-height: 1.5;
        }
        .associated-doctors h4 {
          font-size: 0.95rem;
          color: #7f8c8d;
          margin-bottom: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .doctor-mini-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .doctor-mini-list li {
          padding: 0.4rem 0;
          border-bottom: 1px solid #f0f0f0;
          font-size: 0.95rem;
        }
        .doctor-mini-list li:last-child {
          border-bottom: none;
        }
        .specialization {
          color: #95a5a6;
          font-style: italic;
        }
        .no-doctors {
          color: #95a5a6;
          font-size: 0.9rem;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}

export default ExamListPage;
