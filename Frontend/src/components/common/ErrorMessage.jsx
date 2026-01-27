import { IconX, IconAlertTriangle, IconInfo } from './Icons';
import './ErrorMessage.css';

// Componente per il messaggio di errore, presente in tutte le pagine
function ErrorMessage({ message, onRetry, type = 'error' }) {
  return (
    <div className={`error-message-container ${type}`}>
      <div className="error-icon">
        {type === 'error' && <IconX size={24} />}
        {type === 'warning' && <IconAlertTriangle size={24} />}
        {type === 'info' && <IconInfo size={24} />}
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
