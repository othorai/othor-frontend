'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
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
  Settings
} from 'lucide-react';

interface MetricData {
  percentage_change: number;
  start_date: string;
  end_date: string;
  start_amount: number;
  end_amount: number;
  trend: 'up' | 'down';
  graph_data: Array<{
    date: string;
    value: number;
    ma3?: number;
    ma7?: number;
  }>;
}

interface MetricCardProps {
  title: string;
  data: MetricData;
  onExpand: () => void;
  isExpanded: boolean;
  forecastEnabled?: boolean;
}

const MetricCard = ({ title, data, onExpand, isExpanded, forecastEnabled }: MetricCardProps) => {
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

      <div className="font-bold text-2xl mb-4">
        {data.end_amount.toFixed(2)}
      </div>

      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.graph_data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => new Date(date).toLocaleDateString()}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={(date) => new Date(date).toLocaleDateString()}
              formatter={(value) => [value.toFixed(2), 'Value']}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#c000fa" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
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