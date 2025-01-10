import React from 'react';
import { useTranslation } from 'react-i18next';
import { addMinutes, format, parseISO } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ElectricityPrice } from '../types';
import { AlertCircle } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { convertPrice } from '../utils/formatting';

interface PriceChartProps {
  todayPrices: ElectricityPrice[];
  tomorrowPrices: ElectricityPrice[];
  unit: 'MWh' | 'kWh';
}

export const PriceChart: React.FC<PriceChartProps> = ({
  todayPrices,
  tomorrowPrices,
  unit,
}) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();

  if (!todayPrices.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">
          {t('priceChart')}
        </h2>
        <div className="flex items-center justify-center p-8 text-gray-500 dark:text-gray-400">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{t('noDataAvailable')}</span>
        </div>
      </div>
    );
  }

  const data = [];

  todayPrices.forEach(price => {
    data.push({
      time: format(parseISO(price.dateTime), 'HH:mm'),
      today: convertPrice(price.price, unit),
      originalDate: price.dateTime,
    });
  });

  if (tomorrowPrices.length > 0) {
    data[data.length - 1].tomorrow = data[data.length - 1].today;

    tomorrowPrices.forEach(price => {
      data.push({
        time: format(parseISO(price.dateTime), 'HH:mm'),
        tomorrow: convertPrice(price.price, unit),
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
            {t(payload[0].name)}: €{payload[0].value.toFixed(unit === 'kWh' ? 4 : 2)} {`€/${unit}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-4 dark:text-white flex items-center justify-between">
        <span>{t('priceChart')}</span>
        <span className="text-sm font-normal text-gray-600 dark:text-gray-400">{`€/${unit}`}</span>
      </h2>
      <div className="h-[250px] xs:h-[300px] sm:h-[400px] -mx-4 sm:mx-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#6B7280"
              opacity={0.15}
            />
            <XAxis
              dataKey="time"
              interval="preserveStartEnd"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              stroke="#6B7280"
              tickMargin={8}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6B7280' }}
              stroke="#6B7280"
              tickFormatter={(value) => `€${value}`}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" />
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