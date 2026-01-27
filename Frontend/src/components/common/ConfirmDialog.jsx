import './ConfirmDialog.css';

// Componente per il dialog di conferma, presente in tutte le pagine
function ConfirmDialog({ title, message, confirmLabel = 'Conferma', cancelLabel = 'Annulla', onConfirm, onCancel, isOpen, isDanger }) {
  if (!isOpen) return null;

  return (
    <div className="confirm-dialog-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <h3 className="confirm-dialog-title">{title}</h3>
        <p className="confirm-dialog-message">{message}</p>
        <div className="confirm-dialog-actions">
          <button onClick={onCancel} className="confirm-dialog-button cancel">
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className={`confirm-dialog-button confirm ${isDanger ? 'danger' : ''}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
