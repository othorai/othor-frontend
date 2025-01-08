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

const CustomXAxisTick = ({ x, y, payload }) => {
  const dateMatch = payload.value.match(/\((.*?)\)/);
  const datePart = dateMatch ? dateMatch[1] : '';
  const label = payload.value.includes('Current') ? 'Current' : 'Previous';

  let formattedDate = datePart;

  // Handle different date formats based on type
  if (datePart.includes('Week')) {
    // Weekly format: Show correct week numbers
    const weekMatch = datePart.match(/Week (\d+)/);
    if (weekMatch) {
      const weekNum = parseInt(weekMatch[1]);
      if (label === 'Current') {
        formattedDate = `Week ${weekNum}`;
      } else {
        // Previous week should be weekNum - 1
        formattedDate = `Week ${Math.max(1, weekNum - 1)}`; // Ensure we don't go below Week 1
      }
    }
  } else if (datePart.match(/\d{2}-\d{2}-\d{4}/)) {
    // Daily format
    const [day, month, year] = datePart.split('-');
    const date = new Date(year, month - 1, day);
    formattedDate = format(date, 'dd MMM yyyy');
  } else if (datePart.includes('1st-15th') || datePart.includes('16th')) {
    // Monthly format: Keep the date ranges as is
    formattedDate = datePart;
  }

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={-15}
        textAnchor="middle"
        fill="#666666"
        fontSize={12}
        fontWeight="500"
      >
        {label}
      </text>
      <text
        x={0}
        y={0}
        dy={5}
        textAnchor="middle"
        fill="#666666"
        fontSize={12}
      >
        {formattedDate}
      </text>
    </g>
  );
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
    const pctChange = data.change_percentage || ((data.current - data.previous) / data.previous) * 100;
    const isPos = pctChange >= 0;
    const isValid = !isNaN(pctChange) && isFinite(pctChange) && data.current !== undefined && data.previous !== undefined;

    let currentDate = 'Current';
    let previousDate = 'Previous';

    // Parse dates based on report type
    if (timePeriod) {
      if (timePeriod.includes('weekly')) {
        const weekMatch = timePeriod.match(/Week (\d+)/i);
        if (weekMatch) {
          const weekNum = parseInt(weekMatch[1]);
          currentDate = `Week ${weekNum}`;
          previousDate = `Week ${Math.max(1, weekNum - 1)}`; // Ensure we don't go below Week 1
        }
      } else if (timePeriod.includes('monthly')) {
        const monthMatch = timePeriod.match(/(\w+)\s+(\d{4})\s*\((\d+)(?:st|nd|rd|th)-(\d+)(?:st|nd|rd|th)\)/i);
        if (monthMatch) {
          const [_, month, year, start, end] = monthMatch;
          currentDate = `${start}-${end}`;
          previousDate = '1st-15th';
        }
      } else {
        // Daily format
        const dailyMatch = timePeriod.match(/(\d{2})-(\d{2})-(\d{4})/);
        if (dailyMatch) {
          const [_, day, month, year] = dailyMatch;
          // Create date object from components
          const currentDateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          const prevDateObj = new Date(currentDateObj);
          prevDateObj.setDate(prevDateObj.getDate() - 1);

          // Format dates
          try {
            currentDate = format(currentDateObj, 'dd-MM-yyyy');
            previousDate = format(prevDateObj, 'dd-MM-yyyy');
          } catch (error) {
            console.error('Date formatting error:', error);
            currentDate = 'Current';
            previousDate = 'Previous';
          }
        }
      }
    }

    // Create chart data
    const chartData = [
      { name: `Previous (${previousDate})`, value: data.previous },
      { name: `Current (${currentDate})`, value: data.current }
    ];

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
    positive: '#4CAF50',  // Lighter variant of your primary purple
    negative: '#FF4D8C',  // Pink-red that complements purple
    previous: '#6B7280',  // Neutral gray
    current: '#C000FA'   // Your primary brand color
  }), []);

  const chartProps = useMemo(() => ({
    width: "100%",
    height: 300,
    margin: { top: 20, right: 40, left: 40, bottom: 80 }
  }), []);

  const axisProps = useMemo(() => ({
    xAxis: {
      dataKey: "name",
      height: 60,
      tick: CustomXAxisTick,
      interval: 0,
      tickMargin: 30,
      padding: { left: 0, right: 15 } // Add padding to prevent cropping
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