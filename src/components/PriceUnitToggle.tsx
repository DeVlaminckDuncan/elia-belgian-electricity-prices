import React from 'react';
import { useTranslation } from 'react-i18next';
import { Zap } from 'lucide-react';

interface PriceUnitToggleProps {
  unit: 'MWh' | 'kWh';
  onUnitChange: (unit: 'MWh' | 'kWh') => void;
}

export const PriceUnitToggle: React.FC<PriceUnitToggleProps> = ({ unit, onUnitChange }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center space-x-2">
      <Zap className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      <select
        value={unit}
        onChange={(e) => onUnitChange(e.target.value as 'MWh' | 'kWh')}
        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-300 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="MWh">€/MWh</option>
        <option value="kWh">€/kWh</option>
      </select>
    </div>
  );
};