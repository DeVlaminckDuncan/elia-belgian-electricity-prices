import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';
import { ElectricityPrice } from '../types/electricity';
import { formatDateTime, formatPrice } from '../utils/formatting';
import { getPriceStats, calculatePriceDiffWithPrevious } from '../utils/price-calculations';
import { PriceIndicator } from './PriceIndicator';

interface PriceTableProps {
  prices: ElectricityPrice[];
  title: string;
  currentDateTime?: string;
  highlight?: boolean;
  unit: 'MWh' | 'kWh';
}

export const PriceTable: React.FC<PriceTableProps> = ({ 
  prices, 
  title, 
  currentDateTime, 
  highlight,
  unit,
}) => {
  const { t } = useTranslation();
  const stats = getPriceStats(prices);

  if (!prices.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">{title}</h2>
        <div className="flex items-center justify-center p-8 text-gray-500 dark:text-gray-400">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{t('noDataAvailable')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 ${
      highlight ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-lg font-semibold ${
          highlight ? 'text-blue-600 dark:text-blue-400' : 'dark:text-white'
        }`}>{title}</h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">{`€/${unit}`}</div>
      </div>
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {t('time')}
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {t('price')}
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {t('change')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {prices.map((price, index) => {
                const priceDiff = calculatePriceDiffWithPrevious(price, prices[index - 1]);
                const isCurrentHour = price.dateTime === currentDateTime;
                const isMinPrice = stats?.min.price === price.price;
                const isMaxPrice = stats?.max.price === price.price;

                return (
                  <tr 
                    key={price.dateTime}
                    className={`
                      ${isCurrentHour ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                      ${isMinPrice ? 'bg-green-50 dark:bg-green-900/20' : ''}
                      ${isMaxPrice ? 'bg-red-50 dark:bg-red-900/20' : ''}
                      hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-sm
                    `}
                  >
                    <td className="px-3 py-2 whitespace-nowrap dark:text-gray-300">
                      {formatDateTime(price.dateTime)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap font-medium dark:text-gray-300">
                      {formatPrice(price.price, unit)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {priceDiff && (
                        <PriceIndicator
                          direction={priceDiff.direction}
                          percentage={priceDiff.percentage}
                          className="text-xs"
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};