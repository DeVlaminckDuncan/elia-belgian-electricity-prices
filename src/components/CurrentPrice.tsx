import React from 'react';
import { useTranslation } from 'react-i18next';
import { ElectricityPrice } from '../types';
import { formatPrice } from '../utils/formatting';
import { getMinutesUntilNextHour } from '../utils/time';
import { getPriceChangeIndicator } from '../utils/electricity';
import { Zap, TrendingDown, TrendingUp } from 'lucide-react';
import { PriceIndicator } from './PriceIndicator';
import { getPriceStats } from '../utils/price-calculations';

interface CurrentPriceProps {
  currentPrice?: ElectricityPrice;
  nextPrice?: ElectricityPrice;
  todayPrices: ElectricityPrice[];
  unit: 'MWh' | 'kWh';
}

export const CurrentPrice: React.FC<CurrentPriceProps> = ({ 
  currentPrice, 
  nextPrice, 
  todayPrices = [], // Provide default empty array
  unit 
}) => {
  const { t } = useTranslation();
  const minutesUntilChange = getMinutesUntilNextHour();
  const priceChange = getPriceChangeIndicator(currentPrice, nextPrice);
  const stats = todayPrices.length > 0 ? getPriceStats(todayPrices) : null;
  
  const isLowestPrice = currentPrice && stats?.min.price === currentPrice.price;
  const isHighestPrice = currentPrice && stats?.max.price === currentPrice.price;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          <h2 className="text-lg font-semibold dark:text-white">{t('currentPrice')}</h2>
          {(isLowestPrice || isHighestPrice) && (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              isLowestPrice 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {isLowestPrice ? (
                <>
                  <TrendingDown className="w-3 h-3 mr-1" />
                  {t('lowestToday')}
                </>
              ) : (
                <>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {t('highestToday')}
                </>
              )}
            </span>
          )}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">{`€/${unit}`}</div>
      </div>
      
      <div className="space-y-4">
        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
          {currentPrice ? formatPrice(currentPrice.price, unit) : 'N/A'}
        </div>
        
        {nextPrice && priceChange && (
          <div className="space-y-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('nextHour')}:</div>
            <div className="flex items-center space-x-2">
              <div className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                {formatPrice(nextPrice.price, unit)}
              </div>
              <PriceIndicator 
                direction={priceChange.direction}
                percentage={priceChange.percentage}
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {t(
                priceChange.direction === 'up'
                  ? minutesUntilChange === 1
                    ? 'priceIncreasesIn'
                    : 'priceIncreasesInPlural'
                  : minutesUntilChange === 1
                    ? 'priceDecreasesIn'
                    : 'priceDecreasesInPlural',
                { minutes: minutesUntilChange }
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};