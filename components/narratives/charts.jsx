import React from 'react';
import { Card } from "@/components/ui/card";

const formatYAxisLabel = (value) => {
  if (!value && value !== 0) return '';
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return value.toFixed(2);
};

export function NarrativeChart({ data, parameter }) {
  const colors = {
    positive: '#86B6F6',
    negative: '#FF9EB1',
    previous: '#FF9EB1',
    current: '#86B6F6'
  };

  // Calculate percentage change
  const percentChange = ((data.current - data.previous) / data.previous) * 100;
  const isPositive = percentChange >= 0;

  const type = data.visualization?.type?.toLowerCase() || 'bar';

  const BarDisplay = () => {
    const maxValue = Math.max(data.previous, data.current);
    const previousWidth = (data.previous / maxValue) * 100;
    const currentWidth = (data.current / maxValue) * 100;

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Previous</span>
            <span>{formatYAxisLabel(data.previous)}</span>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#FF9EB1] rounded-full transition-all duration-500" 
              style={{ width: `${previousWidth}%` }}
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Current</span>
            <span>{formatYAxisLabel(data.current)}</span>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#86B6F6] rounded-full transition-all duration-500" 
              style={{ width: `${currentWidth}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  const ComparisonDisplay = () => {
    return (
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 flex flex-col items-center justify-center">
          <div className="text-lg font-semibold text-[#FF9EB1]">
            {formatYAxisLabel(data.previous)}
          </div>
          <div className="text-sm text-gray-500">Previous</div>
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center">
          <div className="text-lg font-semibold text-[#86B6F6]">
            {formatYAxisLabel(data.current)}
          </div>
          <div className="text-sm text-gray-500">Current</div>
        </Card>
        <Card className="col-span-2 p-4 flex items-center justify-center">
          <div className={`text-lg font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? '↑' : '↓'} {Math.abs(percentChange).toFixed(1)}%
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="w-full p-6 rounded-lg bg-white">
      {type === 'bar' ? <BarDisplay /> : <ComparisonDisplay />}
      <div className="mt-4 text-sm text-gray-500 text-center">
        {isPositive ? 'Increased by' : 'Decreased by'} {Math.abs(percentChange).toFixed(1)}%
      </div>
    </div>
  );
}