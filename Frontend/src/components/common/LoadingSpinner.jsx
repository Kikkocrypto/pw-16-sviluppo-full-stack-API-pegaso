import './LoadingSpinner.css';

// Componente per il caricamento, presente in tutte le pagine
function LoadingSpinner({ size = 'medium', message }) {
  return (
    <div className="loading-spinner-container">
      <div className={`loading-spinner ${size}`}></div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
}

export default LoadingSpinner;
