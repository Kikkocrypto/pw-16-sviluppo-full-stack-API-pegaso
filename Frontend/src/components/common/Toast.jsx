/**
 * Componente Toast per notifiche temporanee
 * 
 * Mostra messaggi di successo, errore, warning o info
 * che scompaiono automaticamente dopo alcuni secondi
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
    error: '✗',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div className={`toast toast-${type}`} onClick={onClose}>
      <span className="toast-icon">{icons[type] || icons.info}</span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose} aria-label="Chiudi">
        ×
      </button>
    </div>
  );
}

export default Toast;
