// NPR currency formatting
export const formatNPR = (amount) => {
  return new Intl.NumberFormat('ne-NP', {
    style: 'currency',
    currency: 'NPR',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Date formatting
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-NP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

export const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('en-NP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

// Relative time (e.g. "2 days ago")
export const formatRelative = (date) => {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const diff = new Date(date) - new Date();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (Math.abs(days) < 1) return 'Today';
  if (Math.abs(days) < 7) return rtf.format(days, 'day');
  if (Math.abs(days) < 30) return rtf.format(Math.ceil(days / 7), 'week');
  return rtf.format(Math.ceil(days / 30), 'month');
};

// Truncate long text
export const truncate = (str, length = 50) => {
  if (!str) return '';
  return str.length > length ? `${str.substring(0, length)}...` : str;
};