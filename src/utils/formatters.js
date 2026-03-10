import { format } from 'date-fns';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0);

export const formatNumber = (value) => new Intl.NumberFormat('en-US').format(Number(value) || 0);

export const formatDate = (value, pattern = 'MMM dd, yyyy') => {
  if (!value) {
    return '--';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '--';
  }

  return format(date, pattern);
};

export const formatDateTime = (value) => formatDate(value, 'MMM dd, yyyy HH:mm');

export const toInputDate = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().slice(0, 10);
};

export const toInputTime = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toTimeString().slice(0, 5);
};
