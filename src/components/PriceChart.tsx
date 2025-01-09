import React from 'react';
import { useTranslation } from 'react-i18next';
import { addMinutes, format, parseISO } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ElectricityPrice } from '../types';
import { AlertCircle } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface PriceChartProps {
  yesterdayPrices: ElectricityPrice[];
  todayPrices: ElectricityPrice[];
  tomorrowPrices: ElectricityPrice[];
}

export const PriceChart: React.FC<PriceChartProps> = ({
  yesterdayPrices,
  todayPrices,
  tomorrowPrices,
}) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();

  // If we don't have today's prices, show error
  if (!todayPrices.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 dark:text-white">
          {t('priceChart')}
        </h2>
        <div className="flex items-center justify-center p-8 text-gray-500 dark:text-gray-400">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{t('noDataAvailable')}</span>
        </div>
      </div>
    );
  }

  // Create a continuous data array with all prices
  const data = [];
  
  // Add yesterday's prices
  yesterdayPrices.forEach(price => {
    data.push({
      time: format(parseISO(price.dateTime), 'HH:mm'),
      yesterday: price.price,
      originalDate: price.dateTime,
    });
  });

  // Connect yesterday's and today's lines
  data[data.length - 1].today = data[data.length - 1].yesterday;

  // Add today's prices
  todayPrices.forEach(price => {
    data.push({
      time: format(parseISO(price.dateTime), 'HH:mm'),
      today: price.price,
      originalDate: price.dateTime,
    });
  });

  // Add tomorrow's prices if available
  if (tomorrowPrices.length > 0) {
    // Connect today's and tomorrow's lines
    data[data.length - 1].tomorrow = data[data.length - 1].today;

    // Add the rest of tomorrow's prices
    tomorrowPrices.forEach(price => {
      data.push({
        time: format(parseISO(price.dateTime), 'HH:mm'),
        tomorrow: price.price,
        originalDate: price.dateTime,
      });
    });
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length > 0) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">{label}</p>
          <p
            key={payload[0].name}
            className="text-sm"
            style={{ color: payload[0].color }}
          >
            {t(payload[0].name)}: €{payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 dark:text-white">
        {t('priceChart')}
      </h2>
      <div className="h-[300px] sm:h-[400px] -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#9BA0A8" : "#374151"} opacity={0.1} />
            <XAxis
              dataKey="time"
              interval={3}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              stroke="#6B7280"
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6B7280' }}
              stroke="#6B7280"
              tickFormatter={(value) => `€${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="yesterday"
              name={t('yesterday')}
              stroke="#9CA3AF"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="today"
              name={t('today')}
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
            />
            {tomorrowPrices.length > 0 && (
              <Line
                type="monotone"
                dataKey="tomorrow"
                name={t('tomorrow')}
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};