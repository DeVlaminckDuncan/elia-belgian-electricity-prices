import React from 'react';
import { useTranslation } from 'react-i18next';
import { ElectricityPrice } from '../types';
import { formatPrice } from '../utils/formatting';
import { getMinutesUntilNextHour } from '../utils/time';
import { getPriceChangeIndicator } from '../utils/electricity';
import { Zap } from 'lucide-react';
import { PriceIndicator } from './PriceIndicator';

interface CurrentPriceProps {
  currentPrice?: ElectricityPrice;
  nextPrice?: ElectricityPrice;
  unit: 'MWh' | 'kWh';
}

export const CurrentPrice: React.FC<CurrentPriceProps> = ({ currentPrice, nextPrice, unit }) => {
  const { t } = useTranslation();
  const minutesUntilChange = getMinutesUntilNextHour();
  const priceChange = getPriceChangeIndicator(currentPrice, nextPrice);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          <h2 className="text-lg font-semibold dark:text-white">{t('currentPrice')}</h2>
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