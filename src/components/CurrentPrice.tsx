import React from 'react';
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
  const minutesUntilChange = getMinutesUntilNextHour();
  const priceChange = getPriceChangeIndicator(currentPrice, nextPrice);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Zap className="w-6 h-6 text-yellow-500" />
        <h2 className="text-xl font-semibold">Current Price</h2>
      </div>
      
      <div className="space-y-4">
        <div className="text-4xl font-bold text-blue-600">
          {currentPrice ? formatPrice(currentPrice.price) : 'N/A'}
        </div>
        
        {nextPrice && priceChange && (
          <div className="space-y-2">
            <div className="text-gray-600">Next hour:</div>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-semibold text-gray-800">
                {formatPrice(nextPrice.price)}
              </div>
              <PriceIndicator 
                direction={priceChange.direction}
                percentage={priceChange.percentage}
              />
            </div>
            <div className="text-sm text-gray-500">
              Price {priceChange.direction === 'up' ? 'increases' : 'decreases'} in {minutesUntilChange} minute{minutesUntilChange !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};