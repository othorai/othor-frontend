import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { NarrativeChart } from './charts';
import { Heart, Download, Info } from 'lucide-react';

// Utility function to format the time period
const formatTimePeriod = (timePeriod) => {
  // Extract type (daily/weekly) and date from the format "daily (29-11-2024)" or "weekly (Week 5)"
  const match = timePeriod.match(/(daily|weekly)\s*\((.*?)\)/i);
  
  if (!match) return timePeriod;
  
  const [, type, period] = match;
  
  if (type.toLowerCase() === 'daily') {
    // Parse the date for daily reports
    const [day, month, year] = period.split('-');
    const date = new Date(year, month - 1, day);
    return `Daily Report - ${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${year}`;
  }
  
  if (type.toLowerCase() === 'weekly') {
    // For weekly reports, use current month
    const currentDate = new Date();
    const month = currentDate.toLocaleString('default', { month: 'short' });
    const weekNumber = period.replace('Week ', '');
    return `Weekly Report - Week ${weekNumber} of ${month}`;
  }
  
  return timePeriod;
};

export function NarrativeCard({
  title,
  content,
  graphData,
  sourceInfo,
  category,
  timePeriod,
  articleId,
  isLiked,
  onLike,
}) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [currentMetricIndex, setCurrentMetricIndex] = useState(0);

  const formatMetricName = (metric) => {
    return metric
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const metrics = Object.keys(graphData || {}).filter(key => 
    typeof graphData[key] === 'object' && 
    'current' in graphData[key] &&
    'previous' in graphData[key]
  );

  const truncateText = (text, limit) => {
    if (!text || text.length <= limit) return text;
    return text.slice(0, limit) + '...';
  };

  return (
    <Card className="w-full mb-6">
      <CardContent className="pt-6">
        {/* Time Period */}
        <div className="mb-2 text-sm font-medium text-gray-500">
          {formatTimePeriod(timePeriod)}
        </div>
        
        {/* Title */}
        <h3 className="text-3xl font-medium text-gray-900 mb-3">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-lg mb-6">
          {showFullDescription ? content : truncateText(content, 300)}
          {content.length > 300 && (
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="ml-1 text-primary hover:text-primary-dark font-medium"
            >
              {showFullDescription ? 'Show less' : 'Read more'}
            </button>
          )}
        </p>

        {/* Metrics Navigation */}
        {metrics.length > 1 && (
          <div className="flex gap-2 mb-4 overflow-x-auto py-2">
            {metrics.map((metric, index) => (
              <button
                key={metric}
                onClick={() => setCurrentMetricIndex(index)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                  index === currentMetricIndex
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {formatMetricName(metric)}
              </button>
            ))}
          </div>
        )}

        {/* Chart */}
        {metrics[currentMetricIndex] && (
          <div className="mt-4">
            <NarrativeChart
              data={graphData[metrics[currentMetricIndex]]}
              title={formatMetricName(metrics[currentMetricIndex])}
            />
          </div>
        )}

        {/* Card Actions */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onLike(articleId, !isLiked)}
              className={`flex items-center gap-2 ${
                isLiked ? 'text-red-500' : 'text-gray-600'
              } hover:text-red-600`}
            >
              <Heart className={isLiked ? 'fill-current' : ''} size={18} />
              <span className="text-sm">{isLiked ? 'Liked' : 'Like'}</span>
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
              <Download size={18} />
              <span className="text-sm">PDF</span>
            </button>
            <button className="text-gray-600 hover:text-gray-800">
              <Info size={18} />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}