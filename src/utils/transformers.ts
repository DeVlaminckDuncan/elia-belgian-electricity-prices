import { ElectricityPriceResponse, ElectricityPrice } from '../types';

export const normalizePrice = (price: ElectricityPriceResponse): ElectricityPrice => ({
  dateTime: price.dateTime,
  price: price.price,
});

// Get unique hourly prices (since API returns 15-min intervals)
export const getHourlyPrices = (prices: ElectricityPrice[]): ElectricityPrice[] => {
  const hourlyPrices = new Map<string, ElectricityPrice>();
  
  prices.forEach(price => {
    const hour = price.dateTime.slice(0, 13); // Get YYYY-MM-DDTHH
    if (!hourlyPrices.has(hour)) {
      hourlyPrices.set(hour, price);
    }
  });
  
  return Array.from(hourlyPrices.values());
};