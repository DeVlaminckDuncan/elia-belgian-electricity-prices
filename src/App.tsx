import React, { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ElectricityPrice } from './types';
import { fetchElectricityPrices } from './utils/api';
import { PriceTable } from './components/PriceTable';
import { CurrentPrice } from './components/CurrentPrice';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { ThemeToggle } from './components/ThemeToggle';
import { normalizePrice, getHourlyPrices } from './utils/transformers';
import { getCurrentPrice, getNextPrice } from './utils/electricity';
import { addDays, subDays } from 'date-fns';

function App() {
  const { t } = useTranslation();
  const [todayPrices, setTodayPrices] = useState<ElectricityPrice[]>([]);
  const [yesterdayPrices, setYesterdayPrices] = useState<ElectricityPrice[]>([]);
  const [tomorrowPrices, setTomorrowPrices] = useState<ElectricityPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentPrice = getCurrentPrice(todayPrices);

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
        setError(t('error'));
      } finally {
        setLoading(false);
      }
    };

    fetchAllPrices();

    const interval = setInterval(fetchAllPrices, 15 * 1000);
    return () => clearInterval(interval);
  }, [t]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl dark:text-gray-200">{t('loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-red-600 dark:text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('title')}
          </h1>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <LanguageSwitcher />
            <a
              href="https://www.elia.be/en/grid-data/transmission/day-ahead-reference-price"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              {t('viewOnElia')}
            </a>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <CurrentPrice
            currentPrice={getCurrentPrice(todayPrices)}
            nextPrice={getNextPrice(todayPrices)}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <PriceTable 
            prices={yesterdayPrices} 
            title={t('yesterdayPrices')} 
          />
          <PriceTable 
            prices={todayPrices} 
            title={t('todayPrices')} 
            currentDateTime={currentPrice?.dateTime}
          />
          <PriceTable 
            prices={tomorrowPrices} 
            title={t('tomorrowPrices')} 
          />
        </div>
      </div>
    </div>
  );
}

export default App;