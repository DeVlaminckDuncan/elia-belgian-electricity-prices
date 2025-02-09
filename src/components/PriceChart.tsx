import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ElectricityPrice } from '../types';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { convertPrice } from '../utils/formatting';
import { getPriceStats } from '../utils/price-calculations';
import { getCurrentPrice } from '../utils/electricity';

interface PriceChartProps {
  yesterdayPrices: ElectricityPrice[];
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
    yesterday?: number;
    today?: number;
    tomorrow?: number;
  };
}

const CustomDot: React.FC<DotProps> = ({ cx, cy, payload }) => {
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
  yesterdayStats?: { min: ElectricityPrice; max: ElectricityPrice };
  todayStats?: { min: ElectricityPrice; max: ElectricityPrice };
  tomorrowStats?: { min: ElectricityPrice; max: ElectricityPrice };
  unit: 'MWh' | 'kWh';
  lineKey: string;
}

const MinMaxDot: React.FC<MinMaxDotProps> = ({ cx, cy, payload, yesterdayStats, todayStats, tomorrowStats, unit, lineKey }) => {
  if (!cx || !cy || !payload || !unit) return null;

  const isMinYesterday = yesterdayStats && payload.yesterday === convertPrice(yesterdayStats.min.price, unit);
  const isMaxYesterday = yesterdayStats && payload.yesterday === convertPrice(yesterdayStats.max.price, unit);
  const isMinToday = todayStats && payload.today === convertPrice(todayStats.min.price, unit);
  const isMaxToday = todayStats && payload.today === convertPrice(todayStats.max.price, unit);
  const isMinTomorrow = tomorrowStats && payload.tomorrow === convertPrice(tomorrowStats.min.price, unit);
  const isMaxTomorrow = tomorrowStats && payload.tomorrow === convertPrice(tomorrowStats.max.price, unit);

  if (!isMinYesterday && !isMaxYesterday && !isMinToday && !isMaxToday && !isMinTomorrow && !isMaxTomorrow) return null;

  const color = isMinYesterday || isMinToday || isMinTomorrow ? '#22C55E' : '#EF4444';
  
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
  yesterdayStats?: { min: ElectricityPrice; max: ElectricityPrice },
  todayStats?: { min: ElectricityPrice; max: ElectricityPrice },
  tomorrowStats?: { min: ElectricityPrice; max: ElectricityPrice },
  unit: 'MWh' | 'kWh',
  lineKey: string
}) => {
  const { yesterdayStats, todayStats, tomorrowStats, unit, lineKey } = options;
  const { dataKey, index, payload } = props;

  if (!dataKey || index === undefined) return null;

  const uniqueId = `${lineKey}-${index}-${payload?.time}`;

  return (
    <g key={uniqueId}>
      <CustomDot {...props} key={`current-${uniqueId}`} />
      <MinMaxDot 
        {...props}
        key={`minmax-${uniqueId}`}
        yesterdayStats={yesterdayStats}
        todayStats={todayStats}
        tomorrowStats={tomorrowStats}
        unit={unit}
        lineKey={lineKey}
      />
    </g>
  );
};

const PriceChart: React.FC<PriceChartProps> = ({
  yesterdayPrices,
  todayPrices,
  tomorrowPrices,
  unit,
}) => {
  const { t } = useTranslation();
  const [visibleLines, setVisibleLines] = useState({
    yesterday: false,
    today: true,
    tomorrow: true
  });

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

  const chartData = useMemo(() => {
    const data = [];
    const currentPrice = getCurrentPrice(todayPrices);
    const currentHour = currentPrice ? new Date(currentPrice.dateTime).getHours() : -1;

    if (visibleLines.yesterday) {
      yesterdayPrices.forEach(price => {
        const hour = new Date(price.dateTime).getHours();
        data.push({
          time: format(parseISO(price.dateTime), 'HH:mm'),
          yesterday: convertPrice(price.price, unit),
          originalDate: price.dateTime,
          isCurrentHour: false,
        });
      });

      // Add connecting point if today is visible
      if (visibleLines.today && data.length > 0 && todayPrices.length > 0) {
        const lastYesterdayPrice = yesterdayPrices[yesterdayPrices.length - 1];
        data[data.length - 1].today = convertPrice(lastYesterdayPrice.price, unit);
      }
    }

    if (visibleLines.today) {
      todayPrices.forEach(price => {
        const hour = new Date(price.dateTime).getHours();
        data.push({
          time: format(parseISO(price.dateTime), 'HH:mm'),
          today: convertPrice(price.price, unit),
          originalDate: price.dateTime,
          isCurrentHour: hour === currentHour,
        });
      });
    }

    if (visibleLines.tomorrow && tomorrowPrices.length > 0) {
      // Only add the connecting point if both lines are visible
      if (visibleLines.today && data.length > 0) {
        data[data.length - 1].tomorrow = data[data.length - 1].today;
      }

      tomorrowPrices.forEach(price => {
        data.push({
          time: format(parseISO(price.dateTime), 'HH:mm'),
          tomorrow: convertPrice(price.price, unit),
          originalDate: price.dateTime,
          isCurrentHour: false,
        });
      });
    }

    return data;
  }, [yesterdayPrices, todayPrices, tomorrowPrices, visibleLines, unit]);

  const yesterdayStats = getPriceStats(yesterdayPrices);
  const todayStats = getPriceStats(todayPrices);
  const tomorrowStats = getPriceStats(tomorrowPrices);

  const visiblePrices = useMemo(() => {
    const prices = [];
    if (visibleLines.yesterday) {
      prices.push(...yesterdayPrices.map(p => p.price));
    }
    if (visibleLines.today) {
      prices.push(...todayPrices.map(p => p.price));
    }
    if (visibleLines.tomorrow) {
      prices.push(...tomorrowPrices.map(p => p.price));
    }
    return prices;
  }, [yesterdayPrices, todayPrices, tomorrowPrices, visibleLines]);

  const minPrice = Math.min(...visiblePrices);
  const maxPrice = Math.max(...visiblePrices);
  
  const convertedMin = convertPrice(minPrice, unit);
  const convertedMax = convertPrice(maxPrice, unit);
  const range = convertedMax - convertedMin;
  const padding = range * 0.1;
  
  const yMin = unit === 'kWh' 
    ? Math.floor(convertedMin * 10000) / 10000
    : Math.floor(convertedMin);
  const yMax = unit === 'kWh'
    ? Math.ceil(convertedMax * 10000) / 10000
    : Math.ceil(convertedMax);

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

  const toggleLine = (line: 'yesterday' | 'today' | 'tomorrow') => {
    setVisibleLines(prev => ({
      ...prev,
      [line]: !prev[line]
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold dark:text-white">
          {t('priceChart')}
        </h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => toggleLine('yesterday')}
              className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
            >
              {visibleLines.yesterday ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span>{t('yesterday')}</span>
            </button>
            <button
              onClick={() => toggleLine('today')}
              className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              {visibleLines.today ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span>{t('today')}</span>
            </button>
            {tomorrowPrices.length > 0 && (
              <button
                onClick={() => toggleLine('tomorrow')}
                className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
              >
                {visibleLines.tomorrow ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span>{t('tomorrow')}</span>
              </button>
            )}
          </div>
          <span className="text-sm font-normal text-gray-600 dark:text-gray-400">{`€/${unit}`}</span>
        </div>
      </div>
      <div className="h-[250px] xs:h-[300px] sm:h-[400px] -mx-4 sm:mx-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
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
            {visibleLines.yesterday && (
              <Line
                type="monotone"
                dataKey="yesterday"
                name={t('yesterday')}
                stroke="#9333EA"
                strokeWidth={2}
                dot={(props) => renderDot(props as DotProps, { 
                  yesterdayStats,
                  unit,
                  lineKey: 'yesterday'
                })}
                isAnimationActive={false}
                activeDot={{ r: 6 }}
              />
            )}
            {visibleLines.today && (
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
            )}
            {tomorrowPrices.length > 0 && visibleLines.tomorrow && (
              <Line
                type="monotone"
                dataKey="tomorrow"
                name={t('tomorrow')}
                stroke="#22C55E"
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

export { PriceChart };