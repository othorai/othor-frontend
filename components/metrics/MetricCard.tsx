// components/metrics/MetricCard.tsx
import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { MetricChart } from '@/components/charts/metric-charts';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { Star } from 'lucide-react';

export interface MetricData {
  percentage_change: number;
  trend: 'up' | 'down';
  start_date: string;
  end_date: string;
  start_amount: number;
  end_amount: number;
  graph_data: Array<{
    date: string;
    value: number;
    trend?: string;
    ma3?: number;
    ma7?: number;
  }>;
}

interface MetricCardProps {
  title: string;
  data: MetricData;
  onExpand?: () => void;
  isExpanded?: boolean;
  forecastEnabled?: boolean;
}

const scopeOptions = [
  { label: 'This Week', value: 'this_week' },
  { label: 'This Month', value: 'this_month' },
  { label: 'This Quarter', value: 'this_quarter' },
  { label: 'This Year', value: 'this_year' },
];

const resolutionOptions = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

const MetricCard = ({
  title,
  data: initialData,
  onExpand,
  isExpanded,
  forecastEnabled,
}: MetricCardProps) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [scope, setScope] = useState('this_year');
  const [resolution, setResolution] = useState('monthly');
  const { toast } = useToast();

  const fetchMetricData = useCallback(async (newScope: string, newResolution: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/metrics/single_metric_card?metric=${title.toLowerCase().replace(/ /g, '_')}&scope=${newScope}&resolution=${newResolution}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch metric data');
      }

      const result = await response.json();
      
      if (result.metric_card) {
        setData(result.metric_card);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching metric data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch metric data"
      });
    } finally {
      setLoading(false);
    }
  }, [title, toast]);

  const handleScopeChange = useCallback((newScope: string) => {
    setScope(newScope);
    fetchMetricData(newScope, resolution);
  }, [resolution, fetchMetricData]);

  const handleResolutionChange = useCallback((newResolution: string) => {
    setResolution(newResolution);
    fetchMetricData(scope, newResolution);
  }, [scope, fetchMetricData]);

  if (!isExpanded) {
    return (
      <Card 
        className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={onExpand}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            {forecastEnabled && <Star className="h-4 w-4 text-primary" />}
            <h3 className="font-medium">{title}</h3>
          </div>
          <div className={`text-sm ${data.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {data.percentage_change.toFixed(2)}%
          </div>
        </div>
        <div className="text-2xl font-bold mb-4">
          {data.end_amount.toFixed(2)}
        </div>
        <div className="h-32">
          <MetricChart data={data} type="line" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          {forecastEnabled && <Star className="h-5 w-5 text-primary" />}
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
        <div className="flex gap-4">
          <div className="flex gap-2">
            {scopeOptions.map((option) => (
              <Button
                key={option.value}
                variant={scope === option.value ? "default" : "outline"}
                onClick={() => handleScopeChange(option.value)}
                disabled={loading}
              >
                {option.label}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            {resolutionOptions.map((option) => (
              <Button
                key={option.value}
                variant={resolution === option.value ? "default" : "outline"}
                onClick={() => handleResolutionChange(option.value)}
                disabled={loading}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="h-[400px] mb-6">
        <MetricChart data={data} type="line" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-muted-foreground">Start Date</div>
          <div className="font-medium">{new Date(data.start_date).toLocaleDateString()}</div>
          <div className="font-bold">{data.start_amount.toFixed(2)}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">End Date</div>
          <div className="font-medium">{new Date(data.end_date).toLocaleDateString()}</div>
          <div className="font-bold">{data.end_amount.toFixed(2)}</div>
        </div>
      </div>
    </Card>
  );
};

export default MetricCard;