import './ErrorMessage.css';

// Componente per il messaggio di errore, presente in tutte le pagine
function ErrorMessage({ message, onRetry, type = 'error' }) {
  return (
    <div className={`error-message-container ${type}`}>
      <div className="error-icon">
        {type === 'error' && '✗'}
        {type === 'warning' && '⚠'}
        {type === 'info' && 'ℹ'}
      </div>
      <div className="error-content">
        <p className="error-text">{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="retry-button">
            Riprova
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorMessage;
