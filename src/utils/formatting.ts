import { format, parseISO } from 'date-fns';

export const formatDateTime = (dateTime: string): string => {
  return format(parseISO(dateTime), 'HH:mm');
};

export const convertPrice = (price: number, unit: 'MWh' | 'kWh'): number => {
  return unit === 'kWh' ? price / 1000 : price;
};

export const formatPrice = (price: number, unit: 'MWh' | 'kWh'): string => {
  const convertedPrice = convertPrice(price, unit);
  return `€${unit === 'kWh' ? convertedPrice.toFixed(4) : convertedPrice.toFixed(2)}`;
};