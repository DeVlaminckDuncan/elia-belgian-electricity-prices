import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PriceIndicatorProps {
  direction: 'up' | 'down';
  percentage: number;
  className?: string;
}

export const PriceIndicator: React.FC<PriceIndicatorProps> = ({ direction, percentage, className = '' }) => (
  <div className={`flex items-center ${direction === 'up' ? 'text-red-500' : 'text-green-500'} ${className}`}>
    {direction === 'up' ? (
      <TrendingUp className="w-4 h-4" />
    ) : (
      <TrendingDown className="w-4 h-4" />
    )}
    <span className="text-sm ml-1">
      {percentage.toFixed(1)}%
    </span>
  </div>
);