import React from 'react';
import { AlertCircle } from 'lucide-react';
import { ElectricityPrice } from '../types/electricity';
import { formatDateTime, formatPrice } from '../utils/formatting';
import { getPriceStats, calculatePriceDiffWithPrevious } from '../utils/price-calculations';
import { PriceIndicator } from './PriceIndicator';

interface PriceTableProps {
  prices: ElectricityPrice[];
  title: string;
  currentDateTime?: string;
}

export const PriceTable: React.FC<PriceTableProps> = ({ prices, title, currentDateTime }) => {
  const stats = getPriceStats(prices);

  if (!prices.length) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <div className="flex items-center justify-center p-8 text-gray-500">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>No data available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Time
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Price
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Change
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {prices.map((price, index) => {
              const priceDiff = calculatePriceDiffWithPrevious(price, prices[index - 1]);
              const isCurrentHour = price.dateTime === currentDateTime;
              const isMinPrice = stats?.min.price === price.price;
              const isMaxPrice = stats?.max.price === price.price;

              return (
                <tr 
                  key={price.dateTime}
                  className={`
                    ${isCurrentHour ? 'bg-blue-50' : ''}
                    ${isMinPrice ? 'bg-green-50' : ''}
                    ${isMaxPrice ? 'bg-red-50' : ''}
                    hover:bg-gray-50 transition-colors
                  `}
                >
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {formatDateTime(price.dateTime)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                    {formatPrice(price.price)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {priceDiff && (
                      <PriceIndicator
                        direction={priceDiff.direction}
                        percentage={priceDiff.percentage}
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
  );
};