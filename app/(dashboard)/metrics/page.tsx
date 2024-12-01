'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  X,
  Menu,
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Types
interface GraphPoint {
  date: string;
  value: number;
  ma3?: number;
  ma7?: number;
  trend?: 'up' | 'down';
}

interface MetricData {
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

// Scope Selector Component
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
    <div className="relative">
      <select
        value={currentScope}
        onChange={(e) => onChange(e.target.value)}
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

// Resolution Selector Component
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
    <div className="relative">
      <select
        value={currentResolution}
        onChange={(e) => onChange(e.target.value)}
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

// Metric Card Component
const MetricCard = ({ title, data, onExpand, isExpanded, forecastEnabled }: MetricCardProps) => {
  const [isForecast, setIsForecast] = useState(false);
  const [scope, setScope] = useState('this_year');
  const [resolution, setResolution] = useState('monthly');
  
  const isPositive = data?.trend === 'up';

  if (!data) {
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

  const chartData = data.graph_data.map(point => ({
    ...point,
    date: new Date(point.date).getTime(),
  }));

  const renderChart = () => (
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
        <YAxis
          tickFormatter={formatNumber}
        />
        <Tooltip
          content={<CustomTooltip />}
        />
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
        {!isForecast && data.graph_data[0]?.ma7 && (
          <Line
            type="monotone"
            dataKey="ma7"
            stroke="#90CAF9"
            dot={false}
            name="7-day MA"
            strokeDasharray="3 3"
          />
        )}
        {!isForecast && data.graph_data[0]?.ma3 && (
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
          dot={isExpanded}
          name="Value"
        />
      </LineChart>
    </ResponsiveContainer>
  );

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
            {data.percentage_change.toFixed(2)}%
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="mb-4 flex justify-end space-x-4">
          {forecastEnabled && (
            <div className="flex rounded-lg overflow-hidden border">
              <Button
                variant={isForecast ? "outline" : "default"}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsForecast(false);
                }}
              >
                Current
              </Button>
              <Button
                variant={isForecast ? "default" : "outline"}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsForecast(true);
                }}
              >
                Forecast
              </Button>
            </div>
          )}
          <div className="flex space-x-2">
            <ScopeSelector
              currentScope={scope}
              onChange={(newScope) => {
                setScope(newScope);
                // Handle scope change logic here
              }}
              isForecast={isForecast}
            />
            <ResolutionSelector
              currentResolution={resolution}
              onChange={setResolution}
              scope={scope}
            />
          </div>
        </div>
      )}

      <div className="font-bold text-2xl mb-4">
        {formatNumber(data.end_amount)}
      </div>

      {renderChart()}

      {isExpanded && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Start Date</p>
            <p className="font-medium">{formatDate(data.start_date)}</p>
            <p className="font-bold">{formatNumber(data.start_amount)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">End Date</p>
            <p className="font-medium">{formatDate(data.end_date)}</p>
            <p className="font-bold">{formatNumber(data.end_amount)}</p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default function MetricsPage() {
  const [metricCards, setMetricCards] = useState<Record<string, MetricData>>({});
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [scope, setScope] = useState('this_year');
  const [resolution, setResolution] = useState('monthly');
  const router = useRouter();
  const { toast } = useToast();

  const fetchMetricCards = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(
        `/api/metrics/cards?scope=${scope}&resolution=${resolution}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }

      const data = await response.json();
      setMetricCards(data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load metrics data"
      });
    } finally {
      setLoading(false);
    }
  }, [scope, resolution, router, toast]);

  useEffect(() => {
    fetchMetricCards();
  }, [fetchMetricCards]);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-screen">
        <div className="space-y-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Metrics Overview</h1>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Star className="h-4 w-4" />
            <span>Forecast available</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(metricCards).map(([key, data]) => (
            <MetricCard
              key={key}
              title={key.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
              data={data}
              onExpand={() => setSelectedMetric(selectedMetric === key ? null : key)}
              isExpanded={selectedMetric === key}
              forecastEnabled={['revenue', 'costs', 'units_sold', 'repeat_customers'].includes(key)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}