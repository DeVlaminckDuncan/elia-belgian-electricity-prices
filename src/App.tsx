import React, { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { ElectricityPrice } from './types';
import { fetchElectricityPrices } from './utils/api';
import { PriceTable } from './components/PriceTable';
import { CurrentPrice } from './components/CurrentPrice';
import { normalizePrice, getHourlyPrices } from './utils/transformers';
import { getCurrentPrice, getNextPrice } from './utils/electricity';
import { addDays, subDays } from 'date-fns';

function App() {
  const [todayPrices, setTodayPrices] = useState<ElectricityPrice[]>([]);
  const [yesterdayPrices, setYesterdayPrices] = useState<ElectricityPrice[]>([]);
  const [tomorrowPrices, setTomorrowPrices] = useState<ElectricityPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllPrices = async () => {
      try {
        const today = new Date();
        const yesterday = subDays(today, 1);
        const tomorrow = addDays(today, 1);

        const [todayData, yesterdayData, tomorrowData] = await Promise.all([
          fetchElectricityPrices(today),
          fetchElectricityPrices(yesterday),
          fetchElectricityPrices(tomorrow),
        ]);

        setTodayPrices(getHourlyPrices(todayData.map(normalizePrice)));
        setYesterdayPrices(getHourlyPrices(yesterdayData.map(normalizePrice)));
        setTomorrowPrices(getHourlyPrices(tomorrowData.map(normalizePrice)));
      } catch (err) {
        setError('Failed to fetch electricity prices. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllPrices();
    
    // Refresh data every hour
    const interval = setInterval(fetchAllPrices, 3600000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading electricity prices...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Elia Electricity Prices
          </h1>
          <a
            href="https://www.elia.be/en/grid-data/transmission/day-ahead-reference-price"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View on Elia
          </a>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <CurrentPrice
            currentPrice={getCurrentPrice(todayPrices)}
            nextPrice={getNextPrice(todayPrices)}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <PriceTable prices={yesterdayPrices} title="Yesterday's Prices" />
          <PriceTable prices={todayPrices} title="Today's Prices" />
          <PriceTable prices={tomorrowPrices} title="Tomorrow's Prices" />
        </div>
      </div>
    </div>
  );
}

export default App;