import React, { useState, useEffect } from 'react';
import { getExams } from '../../api/services/exam/examService';
import { getDoctors } from '../../api/services/doctor/doctorService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import { IconClock, IconUser, IconList } from '../../components/common/Icons';
import './ExamListPage.css';
// Pagina di lista degli esami per il paziente o il dottore
function ExamListPage() {
  const [exams, setExams] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Recupera la lista degli esami
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [examsData, doctorsData] = await Promise.all([
          getExams(),
          getDoctors(100)
        ]);
        
        setExams(examsData.filter(e => e.isActive));
        setDoctors(doctorsData);
        setError(null);
      } catch (err) {
        setError('Impossibile caricare il catalogo esami. Riprova più tardi.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getDoctorsForExam = (examId) => {
    return doctors.filter(doctor => 
      doctor.exams && doctor.exams.some(e => e.examId === examId)
    );
  };

  if (loading) return <LoadingSpinner message="Caricamento catalogo..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="exam-list-page container">
      <div className="page-header">
        <h1>Catalogo Esami</h1>
        <p className="subtitle">Sfoglia le prestazioni disponibili e i nostri specialisti.</p>
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
                  <span className="duration-badge"><IconClock size={14} /> {exam.durationMinutes} min</span>
                </div>
                <div className="exam-card-body">
                  <p className="exam-description">{exam.description || 'Nessuna descrizione disponibile.'}</p>
                  
                  <div className="associated-doctors">
                    <h4><IconUser size={14} /> Specialisti abilitati:</h4>
                    {associatedDoctors.length > 0 ? (
                      <ul className="doctor-mini-list">
                        {associatedDoctors.map(doc => (
                          <li key={doc.id}>
                            {doc.gender === 'F' ? 'Dott.ssa' : 'Dott.'} {doc.firstName} {doc.lastName}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="no-doctors">Nessun medico associato.</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ExamListPage;
