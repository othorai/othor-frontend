// components/metrics/MetricCard.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { MetricChart } from '@/components/charts/metric-charts';
import { ForecastChart } from '@/components/charts/forecast-chart';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { Star } from 'lucide-react';
import { API_URL } from '@/lib/config';
import { debounce } from 'lodash';


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
    confidence_interval?: {
      lower: number;
      upper: number;
    };
  }>;
}

interface ScopeOption {
  label: string;
  value: string;
}

interface ForecastPoint {
  date: string;
  value: number;
  confidence_interval: {
    lower: number;
    upper: number;
  };
}

interface ForecastMetadata {
  start_date: string;
  end_date: string;
  duration: string;
  resolution: string;
  source: string;
  model_metrics: any;
  data_points_used: number;
  forecast_points: number;
}

interface ForecastResponse {
  metric_name: string;
  forecast_points: ForecastPoint[];
  metadata: ForecastMetadata;
}

interface ResolutionOption {
  label: string;
  value: string;
}

interface MetricCardProps {
  title: string;
  data: MetricData;
  onExpand?: () => void;
  isExpanded?: boolean;
  forecastEnabled?: boolean;
  isForecast?: boolean;
  scope: string;
  resolution: string;
  onScopeChange: (scope: string) => void;
  onResolutionChange: (resolution: string) => void;
  scopeOptions: ScopeOption[];
  resolutionOptions: ResolutionOption[];
  metricId?: number;
}

const MetricCard = ({
  title,
  data: initialData,
  onExpand,
  isExpanded,
  forecastEnabled,
  isForecast = false,
  scope,
  resolution,
  onScopeChange,
  onResolutionChange,
  scopeOptions,
  resolutionOptions,
  metricId,
}: MetricCardProps) => {
  const [data, setData] = useState<MetricData>(initialData);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  // Keep track of the last fetch parameters to avoid duplicate fetches
  const lastFetchRef = useRef<{
    scope: string;
    resolution: string;
    isForecast: boolean;
    wasActiveMetric: boolean;
  }>({ scope, resolution, isForecast, wasActiveMetric: false });

  useEffect(() => {
    console.log('Initial Data or forecast mode changed:', { 
      title,
      initialData, 
      isForecast,
      wasActiveMetric: lastFetchRef.current.wasActiveMetric,
      metricId 
    });
    
    if (!isForecast) {
      // Reset to initial data when switching back to metric mode
      setData(initialData);
    } else if (metricId) {
      // In forecast mode, fetch data if we have a metric ID
      fetchMetricData(scope, resolution);
    }
  }, [initialData, isForecast, metricId, scope, resolution, title]);

  const fetchMetricData = useCallback(async (newScope: string, newResolution: string) => {
    try {
      console.log('Fetching metric data with:', {
        isForecast,
        metricId,
        newScope,
        newResolution,
        title
      });
      
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) return;
  
      if (isForecast && !metricId) {
        console.error('Metric ID not available for forecast');
        toast({
          variant: "destructive",
          title: "Error",
          description: "Metric ID not available for forecast"
        });
        return;
      }
      
      const params = new URLSearchParams({
        resolution: newResolution
      });
  
      if (isForecast) {
        params.set('metric_id', String(metricId));
        params.set('forecast_duration', newScope);
      } else {
        params.set('metric', title.toLowerCase().replace(/ /g, '_'));
        params.set('scope', newScope);
      }
  
      const endpoint = isForecast 
        ? `${API_URL}/metrics/metric_forecast`
        : `${API_URL}/metrics/single_metric_card`;
  
      const url = `${endpoint}?${params.toString()}`;
      console.log('Fetching from URL:', url);
  
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch metric data');
      }
  
      const result = await response.json();
      console.log('API Response:', result);
      
      if (isForecast) {
        // Check for both top-level data and nested forecast points
        if (!result?.data?.forecast_points?.length && !result?.forecast_points?.length) {
          // Set empty state instead of throwing error
          setData({
            percentage_change: 0,
            trend: 'up',
            start_date: '',
            end_date: '',
            start_amount: 0,
            end_amount: 0,
            graph_data: []
          });
          toast({
            variant: "destructive",
            title: "No Forecast Data",
            description: "No forecast data available for the selected period"
          });
          return;
        }
  
        // Handle both data structures
        const forecastData = result.data?.forecast_points || result.forecast_points;
        const metadata = result.data?.metadata || result.metadata;
        
        const firstPoint = forecastData[0];
        const lastPoint = forecastData[forecastData.length - 1];
        const percentageChange = firstPoint ? 
          ((lastPoint.value - firstPoint.value) / firstPoint.value) * 100 : 0;
  
        const transformedData: MetricData = {
          percentage_change: percentageChange,
          trend: percentageChange >= 0 ? 'up' : 'down',
          start_date: metadata?.start_date || forecastData[0].date,
          end_date: metadata?.end_date || forecastData[forecastData.length - 1].date,
          start_amount: firstPoint.value,
          end_amount: lastPoint.value,
          graph_data: forecastData.map((point: ForecastPoint) => ({
            date: point.date,
            value: point.value,
            confidence_interval: point.confidence_interval
          }))
        };
  
        console.log('Transformed forecast data:', transformedData);
        setData(transformedData);
      } else {
        const metricKey = title.toLowerCase().replace(/ /g, '_');
        if (!result.metrics?.[metricKey]) {
          throw new Error('No metric data available');
        }
      
        const metricData = result.metrics[metricKey];
        const transformedData: MetricData = {
          percentage_change: metricData.change?.percentage ?? 0,
          trend: (metricData.change?.percentage ?? 0) >= 0 ? 'up' : 'down',
          start_date: metricData.trend_data?.[0]?.date ?? '',
          end_date: metricData.trend_data?.[metricData.trend_data.length - 1]?.date ?? '',
          start_amount: metricData.trend_data?.[0]?.value ?? 0,
          end_amount: metricData.current_value ?? 0,
          graph_data: (metricData.trend_data ?? []).map((point: any) => ({
            date: point.date,
            value: point.value,
            trend: point.trend,
            ma3: point.ma3,
            ma7: point.ma7
          }))
        };
      
        console.log('Transformed metric data:', transformedData);
        setData(transformedData);
      }
    } catch (error) {
      console.error('Error fetching metric data:', error);
      // Set empty state on error
      setData({
        percentage_change: 0,
        trend: 'up',
        start_date: '',
        end_date: '',
        start_amount: 0,
        end_amount: 0,
        graph_data: []
      });
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch metric data"
      });
    } finally {
      setLoading(false);
    }
  }, [title, isForecast, toast, metricId]);


  const debouncedFetchMetricData = useCallback(
    debounce((newScope: string, newResolution: string) => {
      // Only update the params, keep the wasActiveMetric state
      lastFetchRef.current = {
        ...lastFetchRef.current,
        scope: newScope,
        resolution: newResolution,
        isForecast
      };
      fetchMetricData(newScope, newResolution);
    }, 300),
    [fetchMetricData, isForecast]
  );
    
  const shouldFetchForecast = useCallback(() => {
    if (!isForecast || !metricId) return false;
  
    const lastFetch = lastFetchRef.current;
    return scope !== lastFetch.scope || resolution !== lastFetch.resolution;
  }, [scope, resolution, isForecast, metricId]);

  useEffect(() => {
    const shouldFetch = shouldFetchForecast();
    console.log('Checking if should fetch forecast:', { 
      title, 
      shouldFetch, 
      isForecast, 
      metricId,
      scope,
      resolution
    });

    if (shouldFetch) {
      fetchMetricData(scope, resolution);
    }
  }, [scope, resolution, isForecast, shouldFetchForecast]);

  useEffect(() => {
    return () => {
      debouncedFetchMetricData.cancel();
    };
  }, [debouncedFetchMetricData]);

  const handleScopeChange = useCallback((newScope: string) => {
  // Mark this metric as the active one when scope changes
  lastFetchRef.current = {
    ...lastFetchRef.current,
    wasActiveMetric: true,
    scope: newScope,
    isForecast // ensure we track the current forecast state
  };
  onScopeChange(newScope);
}, [onScopeChange, isForecast]);

const handleResolutionChange = useCallback((newResolution: string) => {
  // Mark this metric as the active one when resolution changes
  lastFetchRef.current = {
    ...lastFetchRef.current,
    wasActiveMetric: true,
    resolution: newResolution,
    isForecast // ensure we track the current forecast state
  };
  onResolutionChange(newResolution);
}, [onResolutionChange, isForecast]);

  // Reset active metric flag when switching between forecast and metric modes
  useEffect(() => {
    if (lastFetchRef.current.isForecast !== isForecast) {
      lastFetchRef.current.wasActiveMetric = false;
    }
    lastFetchRef.current.isForecast = isForecast;
  }, [isForecast]);
  
    if (!isExpanded) {
      return (
        <Card 
          className="p-4 cursor-pointer hover:shadow-lg transition-shadow flex flex-col"
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
          <div className="flex-1 min-h-0">
            {isForecast ? (
              <ForecastChart data={data} type="line" compactView />
            ) : (
              <MetricChart data={data} type="line" compactView />
            )}
          </div>
        </Card>
      );
    }
  
    return (
      <Card className="w-full">
        <div className="p-6">
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
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
            
            <div className="h-[300px]">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : data.graph_data && data.graph_data.length > 0 ? (
                isForecast ? (
                  <ForecastChart 
                    data={{
                      ...data,
                      isForecast: true
                    }}
                    type="line"
                  />
                ) : (
                  <MetricChart 
                    data={{
                      ...data,
                      isForecast: false
                    }}
                    type="line"
                  />
                )
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No data available</p>
                </div>
              )}
            </div>
  
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Start Date</div>
                <div className="font-medium">
                  {new Date(data.start_date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                <div className="font-bold">{data.start_amount.toFixed(2)}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">
                  {isForecast ? 'Forecast End Date' : 'End Date'}
                </div>
                <div className="font-medium">
                  {new Date(data.end_date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                <div className="font-bold">{data.end_amount.toFixed(2)}</div>
              </div>
            </div>
  
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className={`text-lg font-semibold ${data.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {data.percentage_change >= 0 ? '+' : ''}{data.percentage_change.toFixed(2)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  {isForecast ? 'Forecasted Change' : 'Change'}
                </div>
              </div>
              {forecastEnabled && (
                <div className="text-sm text-muted-foreground">
                  {isForecast ? 'Forecasted values are estimates based on historical data' : 'Historical data'}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  };
  
  export default MetricCard;