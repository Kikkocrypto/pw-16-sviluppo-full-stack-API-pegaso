/**
 * Componente Toast per notifiche temporanee
 * 
 * Design professionale con icone e animazioni fluide
 */

import { useEffect } from 'react';
import './Toast.css';

function Toast({ message, type = 'info', onClose, duration = 5000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: '✓',
    error: '✕',
    warning: '!',
    info: 'i',
  };

  return (
    <div className={`toast toast-${type}`} onClick={onClose} role="alert">
      <div className="toast-icon">
        {icons[type] || icons.info}
      </div>
      <div className="toast-message">
        {message}
      </div>
      <button className="toast-close" onClick={(e) => {
        e.stopPropagation();
        onClose();
      }} aria-label="Chiudi">
        ×
      </button>
    </div>
  );
}

export default Toast;
