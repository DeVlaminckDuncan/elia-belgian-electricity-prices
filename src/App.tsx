import React, { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ElectricityPrice } from './types';
import { fetchElectricityPrices } from './utils/api';
import { PriceTable } from './components/PriceTable';
import { CurrentPrice } from './components/CurrentPrice';
import { PriceChart } from './components/PriceChart';
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {t('title')}
          </h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <LanguageSwitcher />
            <a
              href="https://www.elia.be/en/grid-data/transmission/day-ahead-reference-price"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white text-sm sm:text-base rounded-md hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-1 sm:mr-2" />
              {t('viewOnElia')}
            </a>
          </div>
        </div>

        <div className="w-full">
          <CurrentPrice
            currentPrice={getCurrentPrice(todayPrices)}
            nextPrice={getNextPrice(todayPrices)}
          />
        </div>

        <PriceChart
          yesterdayPrices={yesterdayPrices}
          todayPrices={todayPrices}
          tomorrowPrices={tomorrowPrices}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <PriceTable 
            prices={todayPrices} 
            title={t('todayPrices')} 
            currentDateTime={currentPrice?.dateTime}
            highlight={true}
          />
          <PriceTable 
            prices={tomorrowPrices} 
            title={t('tomorrowPrices')} 
          />
          <PriceTable 
            prices={yesterdayPrices} 
            title={t('yesterdayPrices')} 
          />
        </div>
      </div>
    </div>
  );
}

export default App;