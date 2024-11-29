import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import NarrativeChart from '@/components/charts/narrative-charts';
import { Heart, Download, Info } from 'lucide-react';

const NarrativeCard = ({
  title,
  content,
  graphData,
  sourceInfo,
  category,
  timePeriod,
  articleId,
  isLiked,
  onLike,
}) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [currentMetricIndex, setCurrentMetricIndex] = useState(0);

  const metrics = Object.keys(graphData).filter(key => 
    typeof graphData[key] === 'object' && 
    'current' in graphData[key] &&
    'previous' in graphData[key]
  );

  const formatMetricName = (metric) => {
    return metric
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const truncateText = (text, limit) => {
    if (text.length <= limit) return text;
    return text.slice(0, limit) + '...';
  };

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle className="text-xl font-medium">{title}</CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          {showFullDescription ? content : truncateText(content, 100)}
          {content.length > 100 && (
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="ml-2 text-primary hover:text-primary-dark"
            >
              {showFullDescription ? 'Show less' : 'Read more'}
            </button>
          )}
        </p>
      </CardHeader>
      <CardContent>
        {/* Metrics Navigation */}
        {metrics.length > 1 && (
          <div className="flex gap-2 mb-4 overflow-x-auto py-2">
            {metrics.map((metric, index) => (
              <button
                key={metric}
                onClick={() => setCurrentMetricIndex(index)}
                className={`px-4 py-2 rounded-full text-sm ${
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
            <h3 className="text-lg font-medium mb-4">
              {formatMetricName(metrics[currentMetricIndex])}
            </h3>
            <NarrativeChart
              data={graphData[metrics[currentMetricIndex]]}
              parameter={metrics[currentMetricIndex]}
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
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm">{isLiked ? 'Liked' : 'Like'}</span>
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
              <Download className="w-5 h-5" />
              <span className="text-sm">PDF</span>
            </button>
            <button className="text-gray-600 hover:text-gray-800">
              <Info className="w-5 h-5" />
            </button>
          </div>
          <span className="text-sm text-gray-500">{timePeriod}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default NarrativeCard;