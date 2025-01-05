import { format, parseISO } from 'date-fns';

export const formatDateTime = (dateTime: string): string => {
  return format(parseISO(dateTime), 'HH:mm');
};

export const formatPrice = (price: number): string => {
  return `€${price.toFixed(2)}`;
};