import { ElectricityPrice } from '../types';
import { format, parseISO } from 'date-fns';

export const getCurrentPrice = (prices: ElectricityPrice[] = []): ElectricityPrice | undefined => {
  if (!prices.length) return undefined;
  
  const now = new Date();
  const currentHour = now.getHours();
  return prices.find(
    (price) => parseISO(price.dateTime).getHours() === currentHour
  );
};

export const getNextPrice = (prices: ElectricityPrice[] = []): ElectricityPrice | undefined => {
  if (!prices.length) return undefined;
  
  const now = new Date();
  const nextHour = (now.getHours() + 1) % 24;
  return prices.find(
    (price) => parseISO(price.dateTime).getHours() === nextHour
  );
};

export const getMinutesUntilNextHour = (): number => {
  const now = new Date();
  return 60 - now.getMinutes();
};

export const formatDateTime = (dateTime: string): string => {
  return format(parseISO(dateTime), 'HH:mm');
};

export const formatPrice = (price: number): string => {
  return `€${price.toFixed(2)}`;
};

export const getPriceChangeIndicator = (currentPrice?: ElectricityPrice, nextPrice?: ElectricityPrice) => {
  if (!currentPrice || !nextPrice) return null;
  
  const diff = nextPrice.price - currentPrice.price;
  const percentage = (diff / currentPrice.price) * 100;
  
  return {
    direction: diff > 0 ? 'up' : 'down',
    difference: Math.abs(diff),
    percentage: Math.abs(percentage),
  };
};