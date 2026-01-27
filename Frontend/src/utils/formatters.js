/**
 * Restituisce il titolo professionale in base al genere
 * @param {string} gender - 'M', 'F' o altro
 * @returns {string} 'Dott.', 'Dott.ssa' o stringa vuota
 */
export const getDoctorTitle = (gender) => {
  if (gender === 'F') return 'Dott.ssa';
  if (gender === 'M') return 'Dott.';
  return '';
};

/**
 * Formatta una data in formato italiano (GG/MM/AAAA HH:mm)
 * @param {string|Array} dateValue - La data da formattare
 * @returns {string} Data formattata
 */
export const formatDateTime = (dateValue) => {
  if (!dateValue) return '-';
  
  let date;
  if (Array.isArray(dateValue)) {
    const [year, month, day, hour, minute] = dateValue;
    date = new Date(Date.UTC(year, month - 1, day, hour || 0, minute || 0));
  } else {
    const normalizedDate = typeof dateValue === 'string' && !dateValue.endsWith('Z') && !dateValue.includes('+')
      ? `${dateValue}Z`
      : dateValue;
    date = new Date(normalizedDate);
  }

  if (isNaN(date.getTime())) return 'Data non valida';

  return date.toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formatta una data semplice (GG/MM/AAAA)
 */
export const formatDate = (dateValue) => {
  const formatted = formatDateTime(dateValue);
  return formatted.split(' ')[0];
};
