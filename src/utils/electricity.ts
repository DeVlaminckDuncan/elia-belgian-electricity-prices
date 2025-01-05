import { ElectricityPrice } from '../types';

export const getCurrentPrice = (prices: ElectricityPrice[] = []): ElectricityPrice | undefined => {
  if (!prices.length) return undefined;
  
  const now = new Date();
  const currentHour = now.getHours();
  return prices.find(
    (price) => new Date(price.dateTime).getHours() === currentHour
  );
};

export const getNextPrice = (prices: ElectricityPrice[] = []): ElectricityPrice | undefined => {
  if (!prices.length) return undefined;
  
  const now = new Date();
  const nextHour = (now.getHours() + 1) % 24;
  return prices.find(
    (price) => new Date(price.dateTime).getHours() === nextHour
  );
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