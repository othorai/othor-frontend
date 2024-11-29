import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

/**
 * @param {number} value
 * @returns {string}
 */
const formatValue = (value) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return value.toFixed(2);
};

/**
 * @param {Object} props
 * @param {Object} props.data
 * @param {number} props.data.current
 * @param {number} props.data.previous
 * @param {number} [props.data.change_percentage]
 * @param {Object} [props.data.visualization]
 * @param {('line'|'bar'|'pie'|'area')} [props.data.visualization.type]
 * @param {string} props.title
 */
export function NarrativeChart({ data, title }) {
  // Transform data for recharts
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

  // Determine chart type based on visualization type or data characteristics
  const chartType = data.visualization?.type || 
    (Math.abs(percentageChange) > 50 ? 'pie' : 'bar');

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 30, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={formatValue} />
        <Tooltip
          formatter={(value) => [formatValue(value), 'Value']}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
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
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={formatValue} />
        <Tooltip
          formatter={(value) => [formatValue(value), 'Value']}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={isPositive ? colors.positive : colors.negative}
          strokeWidth={2}
          dot={{ strokeWidth: 2, fill: 'white' }}
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
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );

  // Render the appropriate chart based on type
  const renderChart = () => {
    switch (chartType) {
      case 'pie':
        return renderPieChart();
      case 'line':
        return renderLineChart();
      case 'bar':
      default:
        return renderBarChart();
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