import React from 'react';
import { ElectricityPrice } from '../types';
import { formatPrice, getMinutesUntilNextHour, getPriceChangeIndicator } from '../utils/electricity';
import { Zap, TrendingUp, TrendingDown } from 'lucide-react';

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
              <div className={`flex items-center ${priceChange.direction === 'up' ? 'text-red-500' : 'text-green-500'}`}>
                {priceChange.direction === 'up' ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
                <span className="text-sm ml-1">
                  {priceChange.percentage.toFixed(1)}%
                </span>
              </div>
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