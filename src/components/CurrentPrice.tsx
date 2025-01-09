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
}

export const CurrentPrice: React.FC<CurrentPriceProps> = ({ currentPrice, nextPrice }) => {
  const { t } = useTranslation();
  const minutesUntilChange = getMinutesUntilNextHour();
  const priceChange = getPriceChangeIndicator(currentPrice, nextPrice);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
        <h2 className="text-lg sm:text-xl font-semibold dark:text-white">{t('currentPrice')}</h2>
      </div>
      
      <div className="space-y-4">
        <div className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400">
          {currentPrice ? formatPrice(currentPrice.price) : 'N/A'}
        </div>
        
        {nextPrice && priceChange && (
          <div className="space-y-2">
            <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{t('nextHour')}:</div>
            <div className="flex items-center space-x-2">
              <div className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-200">
                {formatPrice(nextPrice.price)}
              </div>
              <PriceIndicator 
                direction={priceChange.direction}
                percentage={priceChange.percentage}
              />
            </div>
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
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