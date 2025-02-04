//components/narratives/charts.tsx
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
  ScatterChart,
  Scatter,
  FunnelChart,
  Funnel,
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
  // Define axisProps at the top level
  const axisProps = {
    xAxis: {
      dataKey: "name",
      height: 60,
      tick: CustomXAxisTick,
      interval: 0,
      tickMargin: 30,
      padding: { left: 0, right: 15 }
    },
    yAxis: {
      tickFormatter: formatValue,
      width: 80
    }
  };
  
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

    // Get chart type from visualization config or determine default
    let chartType = data.visualization?.type?.toLowerCase() || 'line';
    if (!data.visualization?.type) {
      // Fallback logic
      const metricName = title.toLowerCase();
      if (metricName.includes('ratio') || metricName.includes('percentage')) {
        chartType = 'pie';
      } else if (metricName.includes('cost') || metricName.includes('revenue')) {
        chartType = 'bar';
      } else if (Math.abs(pctChange) > 20) {
        chartType = 'area';
      }
    }

    return {
      chartData,
      percentageChange: pctChange,
      isPositive: isPos,
      isValidData: isValid,
      chartType
    };
  }, [data, title, timePeriod]);

  // Get visualization settings
  const visualConfig = {
    color_scheme: data.visualization?.color_scheme || ['#C000FA'],
    show_points: data.visualization?.show_points ?? true,
    show_trend_lines: data.visualization?.show_trend_lines ?? false
  };


  const renderChart = () => {
    // Get colors and configuration from visualization
    const colors = data.visualization?.value_format?.colors || ['#9467bd'];
    const config = data.visualization || {};
  
    switch (chartType.toLowerCase()) {
      case 'scatter':
        const scatterData = [
          { x: 'Previous', y: data.previous, label: 'Previous' },
          { x: 'Current', y: data.current, label: 'Current' }
        ];
  
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis {...axisProps.xAxis} />
              <YAxis {...axisProps.yAxis} />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-2 border border-gray-200 rounded shadow">
                        <p className="font-medium">{payload[0].payload.label}</p>
                        <p>{formatValue(payload[0].payload.y)}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter
                data={scatterData}
                fill={colors[0]}
                line={{ stroke: colors[0] }}
                shape={(props) => (
                  <circle 
                    {...props} 
                    r={6} 
                    stroke={colors[0]} 
                    strokeWidth={2} 
                    fill="#fff" 
                  />
                )}
              />
            </ScatterChart>
          </ResponsiveContainer>
        );
  
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis {...axisProps.xAxis} />
              <YAxis {...axisProps.yAxis} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="value"
                stroke={colors[0]}
                fill={colors[0]}
                fillOpacity={0.3}
                dot={{
                  stroke: colors[0],
                  strokeWidth: 2,
                  fill: "#fff",
                  r: 4
                }}
              />
              {config.show_trend_lines && (
                <Area
                  type="monotone"
                  dataKey="trend"
                  stroke={colors[1] || colors[0]}
                  strokeDasharray="5 5"
                  fill="none"
                  dot={false}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        );
  
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis {...axisProps.xAxis} />
              <YAxis {...axisProps.yAxis} />
              <Tooltip />
              <Bar dataKey="value">
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                    stroke={colors[index % colors.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
  
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                label
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                    stroke={colors[index % colors.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
  
      case 'line':
      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis {...axisProps.xAxis} />
              <YAxis {...axisProps.yAxis} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke={colors[0]}
                strokeWidth={2}
                dot={{
                  stroke: colors[0],
                  strokeWidth: 2,
                  fill: "#fff",
                  r: 4
                }}
              />
              {config.show_trend_lines && (
                <Line
                  type="monotone"
                  dataKey="trend"
                  stroke={colors[1] || colors[0]}
                  strokeDasharray="5 5"
                  dot={false}
                />
              )}
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