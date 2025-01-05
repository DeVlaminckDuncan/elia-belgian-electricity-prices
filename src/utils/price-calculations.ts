import { ElectricityPrice } from '../types';

export const calculatePriceDiffWithPrevious = (
  currentPrice: ElectricityPrice,
  previousPrice?: ElectricityPrice
) => {
  if (!previousPrice) return null;
  
  const diff = currentPrice.price - previousPrice.price;
  const percentage = (diff / previousPrice.price) * 100;
  
  return {
    direction: diff > 0 ? 'up' : 'down',
    percentage: Math.abs(percentage),
  };
};

export const getPriceStats = (prices: ElectricityPrice[]) => {
  if (!prices.length) return null;

  const min = prices.reduce((a, b) => a.price < b.price ? a : b);
  const max = prices.reduce((a, b) => a.price > b.price ? a : b);

  return { min, max };
};