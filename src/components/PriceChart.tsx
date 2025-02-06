import React from 'react';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ElectricityPrice } from '../types';
import { AlertCircle } from 'lucide-react';
import { convertPrice } from '../utils/formatting';
import { getPriceStats } from '../utils/price-calculations';
import { getCurrentPrice } from '../utils/electricity';

interface PriceChartProps {
  todayPrices: ElectricityPrice[];
  tomorrowPrices: ElectricityPrice[];
  unit: 'MWh' | 'kWh';
}

interface DotProps {
  cx?: number;
  cy?: number;
  index?: number;
  dataKey?: string;
  payload?: {
    isCurrentHour: boolean;
    time: string;
    today?: number;
    tomorrow?: number;
  };
}

const CustomDot: React.FC<DotProps & { key: string }> = ({ cx, cy, payload }) => {
  if (!cx || !cy || !payload?.isCurrentHour) return null;
  
  return (
    <circle 
      cx={cx} 
      cy={cy} 
      r={6} 
      stroke="#3B82F6" 
      strokeWidth={3} 
      fill="#fff" 
    />
  );
};

interface MinMaxDotProps extends DotProps {
  todayStats?: { min: ElectricityPrice; max: ElectricityPrice };
  tomorrowStats?: { min: ElectricityPrice; max: ElectricityPrice };
  unit: 'MWh' | 'kWh';
  key: string;
  lineKey: string;
}

const MinMaxDot: React.FC<MinMaxDotProps> = ({ cx, cy, payload, todayStats, tomorrowStats, unit }) => {
  if (!cx || !cy || !payload || !unit) return null;

  const isMinToday = todayStats && payload.today === convertPrice(todayStats.min.price, unit);
  const isMaxToday = todayStats && payload.today === convertPrice(todayStats.max.price, unit);
  const isMinTomorrow = tomorrowStats && payload.tomorrow === convertPrice(tomorrowStats.min.price, unit);
  const isMaxTomorrow = tomorrowStats && payload.tomorrow === convertPrice(tomorrowStats.max.price, unit);

  if (!isMinToday && !isMaxToday && !isMinTomorrow && !isMaxTomorrow) return null;

  const color = isMinToday || isMinTomorrow ? '#22C55E' : '#EF4444';
  
  return (
    <circle 
      cx={cx} 
      cy={cy} 
      r={5} 
      stroke={color}
      strokeWidth={2.5}
      fill="#fff"
    />
  );
};

const renderDot = (props: DotProps, options: { 
  todayStats?: { min: ElectricityPrice; max: ElectricityPrice },
  tomorrowStats?: { min: ElectricityPrice; max: ElectricityPrice },
  unit: 'MWh' | 'kWh',
  lineKey: string
}) => {
  const { todayStats, tomorrowStats, unit, lineKey } = options;
  const { dataKey, index } = props;

  if (!dataKey || index === undefined) return null;

  const currentKey = `${lineKey}-current-${index}`;
  const minMaxKey = `${lineKey}-minmax-${index}`;

  return (
    <g key={`${lineKey}-group-${index}`}>
      <CustomDot key={currentKey} {...props} />
      <MinMaxDot 
        key={minMaxKey}
        {...props}
        todayStats={todayStats}
        tomorrowStats={tomorrowStats}
        unit={unit}
        lineKey={lineKey}
      />
    </g>
  );
};

const PriceChart: React.FC<PriceChartProps> = ({
  todayPrices,
  tomorrowPrices,
  unit,
}) => {
  const { t } = useTranslation();

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
  const todayStats = getPriceStats(todayPrices);
  const tomorrowStats = getPriceStats(tomorrowPrices);
  const currentPrice = getCurrentPrice(todayPrices);
  const currentHour = currentPrice ? new Date(currentPrice.dateTime).getHours() : -1;

  todayPrices.forEach(price => {
    const hour = new Date(price.dateTime).getHours();
    data.push({
      time: format(parseISO(price.dateTime), 'HH:mm'),
      today: convertPrice(price.price, unit),
      originalDate: price.dateTime,
      isCurrentHour: hour === currentHour,
    });
  });

  if (tomorrowPrices.length > 0) {
    data[data.length - 1].tomorrow = data[data.length - 1].today;

    tomorrowPrices.forEach(price => {
      data.push({
        time: format(parseISO(price.dateTime), 'HH:mm'),
        tomorrow: convertPrice(price.price, unit),
        originalDate: price.dateTime,
        isCurrentHour: false,
      });
    });
  }

  // Calculate dynamic domain based on unit
  const allPrices = [...todayPrices.map(p => p.price), ...tomorrowPrices.map(p => p.price)];
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  
  // Convert min/max to the selected unit and add padding
  const convertedMin = convertPrice(minPrice, unit);
  const convertedMax = convertPrice(maxPrice, unit);
  const range = convertedMax - convertedMin;
  const padding = range * 0.1;
  
  // Round the values appropriately based on the unit
  const yMin = unit === 'kWh' 
    ? Math.floor(convertedMin * 10000) / 10000 // Round to 4 decimal places for kWh
    : Math.floor(convertedMin); // Round to whole numbers for MWh
  const yMax = unit === 'kWh'
    ? Math.ceil(convertedMax * 10000) / 10000 // Round to 4 decimal places for kWh
    : Math.ceil(convertedMax); // Round to whole numbers for MWh

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length > 0) {
      const value = payload[0].value;
      
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">{label}</p>
          <p className="text-sm" style={{ color: payload[0].color }}>
            {`${value.toFixed(unit === 'kWh' ? 4 : 2)} €/${unit}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold dark:text-white">
          {t('priceChart')}
        </h2>
        <span className="text-sm font-normal text-gray-600 dark:text-gray-400">{`€/${unit}`}</span>
      </div>
      <div className="h-[250px] xs:h-[300px] sm:h-[400px] -mx-4 sm:mx-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid 
              strokeDasharray="1 10"
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
              tickFormatter={(value) => `€${value.toFixed(unit === 'kWh' ? 4 : 2)}`}
              width={75}
              domain={[yMin - padding, yMax + padding]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" />
            <Line
              type="monotone"
              dataKey="today"
              name={t('today')}
              stroke="#3B82F6"
              strokeWidth={2}
              dot={(props) => renderDot(props as DotProps, { 
                todayStats,
                unit,
                lineKey: 'today'
              })}
              isAnimationActive={false}
              activeDot={{ r: 6 }}
            />
            {tomorrowPrices.length > 0 && (
              <Line
                type="monotone"
                dataKey="tomorrow"
                name={t('tomorrow')}
                stroke="#10B981"
                strokeWidth={2}
                dot={(props) => renderDot(props as DotProps, { 
                  tomorrowStats,
                  unit,
                  lineKey: 'tomorrow'
                })}
                isAnimationActive={false}
                activeDot={{ r: 6 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriceChart;

export { PriceChart }