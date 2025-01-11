import { ElectricityPrice } from '../types';

export const getCurrentPrice = (prices: ElectricityPrice[] = []): ElectricityPrice | undefined => {
  if (!prices.length) return undefined;
  
  const now = new Date();
  const currentHour = now.getHours();
  return prices.find(
    (price) => new Date(price.dateTime).getHours() === currentHour
  );
};

export const getNextPrice = (prices: ElectricityPrice[] = [], tomorrowPrices: ElectricityPrice[] = []): ElectricityPrice | undefined => {
  if (!prices.length) return undefined;
  
  const now = new Date();
  const currentHour = now.getHours();
  
  // If it's 23:00, get the first price (00:00) from tomorrow's prices
  if (currentHour === 23 && tomorrowPrices.length > 0) {
    return tomorrowPrices[0];
  }
  
  // Otherwise, get the next hour's price from today's prices
  return prices.find(
    (price) => new Date(price.dateTime).getHours() === (currentHour + 1) % 24
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