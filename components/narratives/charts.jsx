import React, { useMemo } from 'react';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';

const formatValue = (value) => {
  if (!value && value !== 0) return '';
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return value.toFixed(2);
};

export function NarrativeChart({ data, title, timePeriod }) {
  // Memoize calculations to prevent unnecessary rerenders
  const {
    chartData,
    percentageChange,
    isPositive,
    isValidData,
    chartType
  } = useMemo(() => {
    // Calculate percentage change
    const pctChange = data.change_percentage || ((data.current - data.previous) / data.previous) * 100;
    const isPos = pctChange >= 0;
    const isValid = !isNaN(pctChange) && isFinite(pctChange) && data.current !== undefined && data.previous !== undefined;

    // Parse dates
    const dateMatch = timePeriod?.match(/\((.*?)\)/);
    const currentDate = dateMatch ? dateMatch[1] : 'Current';
    let previousDate = 'Previous';

    if (currentDate.match(/\d{2}-\d{2}-\d{4}/)) {
      const [day, month, year] = currentDate.split('-');
      const date = new Date(year, month - 1, day);
      const prevDate = new Date(date);
      prevDate.setDate(prevDate.getDate() - 1);
      previousDate = format(prevDate, 'dd MMM yy');
    }

    // Determine chart type
    let type = 'line'; // default
    const metricName = title.toLowerCase();
    
    if (metricName.includes('ratio') || 
        metricName.includes('index') || 
        metricName.includes('percentage')) {
      type = 'pie';
    } else if (metricName.includes('cost') || 
               metricName.includes('revenue') || 
               metricName.includes('sales')) {
      type = 'bar';
    } else if (Math.abs(pctChange) > 20) {
      type = 'area';
    }

    // Create chart data
    const chartData = [
      { name: `Previous (${previousDate})`, value: data.previous },
      { name: `Current (${currentDate})`, value: data.current }
    ];

    return {
      chartData,
      percentageChange: pctChange,
      isPositive: isPos,
      isValidData: isValid,
      chartType: type
    };
  }, [data, title, timePeriod]);

  // Memoize colors and styles
  const colors = useMemo(() => ({
    positive: '#4CAF50',
    negative: '#FF5252',
    previous: '#FF9EB1',
    current: '#86B6F6'
  }), []);

  const chartProps = useMemo(() => ({
    width: "100%",
    height: 300,
    margin: { top: 20, right: 30, left: 30, bottom: 20 }
  }), []);

  const axisProps = useMemo(() => ({
    xAxis: {
      dataKey: "name",
      angle: -15,
      textAnchor: "end",
      height: 60,
      tick: { fontSize: 12 }
    },
    yAxis: {
      tickFormatter: formatValue,
      width: 80
    }
  }), []);

  const tooltipProps = useMemo(() => ({
    formatter: (value) => [formatValue(value), 'Value'],
    contentStyle: {
      backgroundColor: 'white',
      border: '1px solid #ccc',
      borderRadius: '4px',
      padding: '8px'
    }
  }), []);

  const renderChart = () => {
    console.log(`Rendering ${chartType} chart for ${title} (${isValidData ? percentageChange.toFixed(2) + '%' : 'N/A'} change)`);

    switch (chartType) {
      case 'pie':
        return (
          <ResponsiveContainer {...chartProps}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                label={({ value }) => formatValue(value)}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={index === 0 ? colors.previous : colors.current}
                  />
                ))}
              </Pie>
              <Tooltip {...tooltipProps} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer {...chartProps}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis {...axisProps.xAxis} />
              <YAxis {...axisProps.yAxis} />
              <Tooltip {...tooltipProps} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={index === 0 ? colors.previous : colors.current}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer {...chartProps}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis {...axisProps.xAxis} />
              <YAxis {...axisProps.yAxis} />
              <Tooltip {...tooltipProps} />
              <Area
                type="monotone"
                dataKey="value"
                fill={isPositive ? colors.positive : colors.negative}
                stroke={isPositive ? colors.positive : colors.negative}
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'line':
      default:
        return (
          <ResponsiveContainer {...chartProps}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis {...axisProps.xAxis} />
              <YAxis {...axisProps.yAxis} />
              <Tooltip {...tooltipProps} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={isPositive ? colors.positive : colors.negative}
                strokeWidth={2}
                dot={{ strokeWidth: 2, fill: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="w-full bg-white rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">{title}</h3>
        {isValidData && (
          <div className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'} font-medium`}>
            {isPositive ? '↑' : '↓'} {Math.abs(percentageChange).toFixed(1)}%
          </div>
        )}
      </div>
      {renderChart()}
      {isValidData && (
        <div className="mt-4 text-sm text-gray-500 text-center">
          {isPositive ? 'Increased' : 'Decreased'} by {Math.abs(percentageChange).toFixed(1)}% from previous period
        </div>
      )}
    </div>
  );
}