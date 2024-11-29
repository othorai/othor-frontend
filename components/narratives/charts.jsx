import React from 'react';
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

export function NarrativeChart({ data, title }) {
  const chartData = [
    { name: 'Previous', value: data.previous },
    { name: 'Current', value: data.current }
  ];

  const colors = {
    previous: '#FF9EB1',
    current: '#86B6F6',
    positive: '#4CAF50',
    negative: '#FF5252'
  };

  // Calculate percentage change
  const percentageChange = ((data.current - data.previous) / data.previous) * 100;
  const isPositive = percentageChange >= 0;

  // Get visualization type from data
  const chartType = data.visualization?.type?.toLowerCase() || 'line';

  // Common tooltip styles
  const tooltipStyle = {
    contentStyle: {
      backgroundColor: 'white',
      border: '1px solid #ccc',
      borderRadius: '4px',
      padding: '8px'
    }
  };

  const renderAreaChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 30, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={formatValue} />
        <Tooltip 
          formatter={(value) => [formatValue(value), 'Value']}
          {...tooltipStyle}
        />
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

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 30, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={formatValue} />
        <Tooltip 
          formatter={(value) => [formatValue(value), 'Value']}
          {...tooltipStyle}
        />
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

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 30, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={formatValue} />
        <Tooltip 
          formatter={(value) => [formatValue(value), 'Value']}
          {...tooltipStyle}
        />
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

  const renderPieChart = () => (
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
          label={({ value }) => formatValue(value)}
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`}
              fill={index === 0 ? colors.previous : colors.current}
            />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value) => [formatValue(value), 'Value']}
          {...tooltipStyle}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );

  // Render chart based on type
  const renderChart = () => {
    console.log('Rendering chart type:', chartType);
    switch (chartType) {
      case 'area':
        return renderAreaChart();
      case 'bar':
        return renderBarChart();
      case 'pie':
        return renderPieChart();
      case 'line':
      default:
        return renderLineChart();
    }
  };

  return (
    <div className="w-full bg-white rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">{title}</h3>
        <div className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '↑' : '↓'} {Math.abs(percentageChange).toFixed(1)}%
        </div>
      </div>
      {renderChart()}
      <div className="mt-4 text-sm text-gray-500 text-center">
        {isPositive ? 'Increased' : 'Decreased'} by {Math.abs(percentageChange).toFixed(1)}% from previous period
      </div>
    </div>
  );
}