'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Star,
  ChevronDown,
} from 'lucide-react';

// Types
export interface GraphPoint {
  date: string;
  value: number;
  ma3?: number;
  ma7?: number;
  trend?: 'up' | 'down';
}

export interface MetricData {
  percentage_change: number;
  start_date: string;
  end_date: string;
  start_amount: number;
  end_amount: number;
  trend: 'up' | 'down';
  graph_data: GraphPoint[];
  forecast_data?: GraphPoint[];
}

interface MetricCardProps {
  title: string;
  data: MetricData;
  onExpand: () => void;
  isExpanded: boolean;
  forecastEnabled?: boolean;
}

// Utility Functions
const formatNumber = (value: number): string => {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  } else if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  } else if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toFixed(2);
};



const formatDate = (dateString: string, resolution: string = 'daily'): string => {
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  switch (resolution) {
    case 'monthly':
      return `${months[date.getMonth()]} ${date.getFullYear()}`;
    case 'quarterly':
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      return `Q${quarter} ${date.getFullYear()}`;
    case 'weekly':
      return `${date.getDate()} ${months[date.getMonth()]}`;
    case 'daily':
    default:
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }
};

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
      <p className="font-medium text-sm text-gray-600">{formatDate(label)}</p>
      {payload.map((item: any, index: number) => (
        <div key={index} className="flex items-center gap-2 mt-1">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <p className="text-sm">
            <span className="font-medium">{item.name}: </span>
            {formatNumber(item.value)}
          </p>
        </div>
      ))}
    </div>
  );
};

const ScopeSelector = ({
  currentScope,
  onChange,
  isForecast
}: {
  currentScope: string;
  onChange: (scope: string) => void;
  isForecast: boolean;
}) => {
  const currentScopeOptions = [
    { label: 'This Week', value: 'this_week' },
    { label: 'This Month', value: 'this_month' },
    { label: 'This Quarter', value: 'this_quarter' },
    { label: 'This Year', value: 'this_year' },
  ];

  const forecastScopeOptions = [
    { label: 'Next Week', value: 'next_week' },
    { label: 'Next Month', value: 'next_month' },
    { label: 'Next Quarter', value: 'next_quarter' },
    { label: 'Next Year', value: 'next_year' },
  ];

  const options = isForecast ? forecastScopeOptions : currentScopeOptions;

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <select
        value={currentScope}
        onChange={(e) => {
          e.stopPropagation();
          onChange(e.target.value);
        }}
        className="appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 pr-8"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
    </div>
  );
};

const ResolutionSelector = ({
  currentResolution,
  onChange,
  scope
}: {
  currentResolution: string;
  onChange: (resolution: string) => void;
  scope: string;
}) => {
  const getValidResolutions = (selectedScope: string) => {
    const allResolutions = [
      { label: 'Daily', value: 'daily' },
      { label: 'Weekly', value: 'weekly' },
      { label: 'Monthly', value: 'monthly' },
      { label: 'Quarterly', value: 'quarterly' },
    ];

    switch (selectedScope) {
      case 'this_week':
      case 'next_week':
        return allResolutions.slice(0, 1);
      case 'this_month':
      case 'next_month':
        return allResolutions.slice(0, 2);
      case 'this_quarter':
      case 'next_quarter':
        return allResolutions.slice(0, 3);
      case 'this_year':
      case 'next_year':
        return allResolutions;
      default:
        return allResolutions;
    }
  };

  const validResolutions = getValidResolutions(scope);

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <select
        value={currentResolution}
        onChange={(e) => {
          e.stopPropagation();
          onChange(e.target.value);
        }}
        className="appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 pr-8"
      >
        {validResolutions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
    </div>
  );
};

const MetricCard = ({ title, data, onExpand, isExpanded, forecastEnabled }: MetricCardProps) => {
    const [isForecast, setIsForecast] = useState(false);
    const [scope, setScope] = useState('this_year');
    const [resolution, setResolution] = useState('monthly');
    const [chartData, setChartData] = useState(data.graph_data || []);
    const [loading, setLoading] = useState(false);
    const [metricData, setMetricData] = useState<MetricData>(data);
    const { toast } = useToast();

  const fetchMetricData = async (newScope: string, newResolution: string, isForecastView: boolean) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
  
      // Choose the correct endpoint based on whether we're fetching forecast data
      const endpoint = isForecastView 
        ? '/api/metrics/metric_forecast'
        : '/api/metrics/single_metric_card';
  
      const params = new URLSearchParams({
        metric: title.toLowerCase().replace(/ /g, '_'),
        scope: newScope,
        resolution: newResolution
      });
  
      const response = await fetch(`${endpoint}?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch metric data');
      }
  
      const responseData = await response.json();
      
      // Transform the data based on whether it's forecast or regular data
      const newData = isForecastView ? {
        percentage_change: responseData.forecast?.percentage_change || 0,
        start_date: responseData.forecast?.start_date,
        end_date: responseData.forecast?.end_date,
        start_amount: responseData.forecast?.start_amount || 0,
        end_amount: responseData.forecast?.end_amount || 0,
        trend: responseData.forecast?.trend || 'up',
        graph_data: responseData.forecast?.points?.map((point: any) => ({
          date: new Date(point.date).getTime(),
          value: point.value,
          ma3: point.ma3,
          ma7: point.ma7
        })) || []
      } : {
        percentage_change: responseData.percentage_change || 0,
        start_date: responseData.start_date,
        end_date: responseData.end_date,
        start_amount: responseData.start_amount || 0,
        end_amount: responseData.end_amount || 0,
        trend: responseData.trend || 'up',
        graph_data: responseData.graph_data?.map((point: any) => ({
          date: new Date(point.date).getTime(),
          value: point.value,
          ma3: point.ma3,
          ma7: point.ma7
        })) || []
      };
  
      setChartData(newData.graph_data);
      setMetricData(newData);
  
    } catch (error) {
      console.error('Error fetching metric data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update chart data"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScopeChange = (newScope: string) => {
    console.log('Changing scope to:', newScope);
    setScope(newScope);
    fetchMetricData(newScope, resolution, isForecast);
  };
  
  const handleResolutionChange = (newResolution: string) => {
    console.log('Changing resolution to:', newResolution);
    setResolution(newResolution);
    fetchMetricData(scope, newResolution, isForecast);
  };
  
  const handleForecastToggle = (newIsForecast: boolean) => {
    console.log('Toggling forecast:', newIsForecast);
    setIsForecast(newIsForecast);
    fetchMetricData(scope, resolution, newIsForecast);
  };

  useEffect(() => {
    if (data?.graph_data) {
      setChartData(data.graph_data.map(point => ({
        ...point,
        date: new Date(point.date).getTime(),
      })));
      setMetricData(data);  // Add this line to keep metricData in sync with props
    }
  }, [data]);

  const isPositive = metricData?.trend === 'up';

  if (!metricData) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isExpanded ? 'col-span-3' : ''
      }`}
      onClick={onExpand}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2">
          {forecastEnabled && (
            <Star className="h-4 w-4 text-primary" />
          )}
          <h3 className="font-semibold text-lg">{title}</h3>
        </div>
        <div className={`flex items-center space-x-1 ${
          isPositive ? 'text-green-600' : 'text-red-600'
        }`}>
          {isPositive ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          <span className="font-medium">
            {metricData.percentage_change.toFixed(2)}%
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="mb-4 flex justify-end space-x-4" onClick={(e) => e.stopPropagation()}>
          {forecastEnabled && (
            <div className="flex rounded-lg overflow-hidden border">
              <Button
                variant={isForecast ? "outline" : "default"}
                onClick={(e) => {
                  e.stopPropagation();
                  handleForecastToggle(false);
                }}
              >
                Current
              </Button>
              <Button
                variant={isForecast ? "default" : "outline"}
                onClick={(e) => {
                  e.stopPropagation();
                  handleForecastToggle(true);
                }}
              >
                Forecast
              </Button>
            </div>
          )}
          <div className="flex space-x-2">
            <ScopeSelector
              currentScope={scope}
              onChange={handleScopeChange}
              isForecast={isForecast}
            />
            <ResolutionSelector
              currentResolution={resolution}
              onChange={handleResolutionChange}
              scope={scope}
            />
          </div>
        </div>
      )}

      <div className="font-bold text-2xl mb-4">
        {formatNumber(metricData.end_amount)}
      </div>

      {loading ? (
        <div className="h-[160px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={isExpanded ? 400 : 160}>
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              type="number"
              domain={['auto', 'auto']}
              tickFormatter={(timestamp) => formatDate(new Date(timestamp).toISOString(), resolution)}
              scale="time"
            />
            <YAxis tickFormatter={formatNumber} />
            <Tooltip content={<CustomTooltip />} />
            {isExpanded && (
              <Legend
                content={({ payload }) => (
                  <div className="flex justify-center gap-4 mt-2">
                    {payload?.map((entry: any, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm text-gray-600">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              />
            )}
            {!isForecast && chartData[0]?.ma7 && (
              <Line
                type="monotone"
                dataKey="ma7"
                stroke="#90CAF9"
                dot={false}
                name="7-day MA"
                strokeDasharray="3 3"
              />
            )}
            {!isForecast && chartData[0]?.ma3 && (
              <Line
                type="monotone"
                dataKey="ma3"
                stroke="#81C784"
                dot={false}
                name="3-day MA"
                strokeDasharray="2 2"
              />
            )}
            <Line
              type="monotone"
              dataKey="value"
              stroke="#c000fa"
              strokeWidth={2}
              dot={{
                r: 2,
                fill: '#c000fa',
                strokeWidth: 0
              }}
              activeDot={{
                r: 4,
                stroke: '#c000fa',
                strokeWidth: 2,
                fill: 'white'
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {isExpanded && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Start Date</p>
            <p className="font-medium">{formatDate(metricData.start_date)}</p>
            <p className="font-bold">{formatNumber(metricData.start_amount)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">End Date</p>
            <p className="font-medium">{formatDate(metricData.end_date)}</p>
            <p className="font-bold">{formatNumber(metricData.end_amount)}</p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default MetricCard;