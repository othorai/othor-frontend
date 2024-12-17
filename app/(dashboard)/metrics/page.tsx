// app/(dashboard)/metrics/page.tsx
'use client';

import { useState, useEffect, useCallback , useMemo, useRef} from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { Star } from 'lucide-react';
import MetricCard from '@/components/metrics/MetricCard';
import type { MetricData } from '@/components/metrics/MetricCard';
import { ChevronLeft } from 'lucide-react'; // Add this import
import { API_URL } from '@/lib/config';


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

const resolutionOptions = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

const DEFAULT_FORECAST_METRICS = ['revenue', 'costs', 'units_sold', 'repeat_customers'];

function MetricsPage() {
  const [metricCards, setMetricCards] = useState<Record<string, MetricData>>({});
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [scope, setScope] = useState('this_year');
  const [resolution, setResolution] = useState('monthly');
  const [isForecast, setIsForecast] = useState(false);
  const [forecastableMetrics, setForecastableMetrics] = useState<string[]>(DEFAULT_FORECAST_METRICS);
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast: showToast } = useToast();
  const initializationRef = useRef(false);
  const [metricIds, setMetricIds] = useState<Record<string, number>>({});


  const transformCurrentData = (data: any): Record<string, MetricData> => {
    const transformed: Record<string, MetricData> = {};
    
    if (data?.metrics) {
      Object.entries(data.metrics).forEach(([key, metric]: [string, any]) => {
        transformed[key] = {
          percentage_change: metric.change?.percentage ?? 0,
          trend: (metric.change?.percentage ?? 0) >= 0 ? 'up' : 'down',
          start_date: data.metadata?.start_date ?? new Date().toISOString(),
          end_date: data.metadata?.end_date ?? new Date().toISOString(),
          start_amount: metric.previous_value ?? 0,
          end_amount: metric.current_value ?? 0,
          graph_data: (metric.trend_data ?? []).map((point: any) => ({
            date: point.date ?? new Date().toISOString(),
            value: typeof point.value === 'number' ? point.value : 0,
            trend: point.trend ?? 'up',
            ma3: point.ma3 ?? null,
            ma7: point.ma7 ?? null,
          }))
        };
      });
    }
    
    return transformed;
  };

  const transformForecastData = (data: any): Record<string, MetricData> => {
    const transformed: Record<string, MetricData> = {};
    
    if (data?.forecasts) {
      Object.entries(data.forecasts).forEach(([key, forecast]: [string, any]) => {
        transformed[key] = {
          percentage_change: forecast.change_percentage || 0,
          trend: (forecast.change_percentage || 0) >= 0 ? 'up' : 'down',
          start_date: forecast.start_date || new Date().toISOString(),
          end_date: forecast.end_date || new Date().toISOString(),
          start_amount: forecast.start_value || 0,
          end_amount: forecast.end_value || 0,
          graph_data: (forecast.points || []).map((point: any) => ({
            date: point.date || new Date().toISOString(),
            value: point.value || 0
          }))
        };
      });
    }
    
    return transformed;
  };

  const fetchForecastMetrics = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }
  
      const response = await fetch(`${API_URL}/metrics/available_forecast_metrics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        console.warn('Failed to fetch forecast metrics, using defaults');
        return;
      }
  
      const data = await response.json();
      if (data?.metrics) {
        const availableMetrics = new Set<string>();
        
        Object.values(data.metrics).forEach((categoryMetrics: any) => {
          if (Array.isArray(categoryMetrics)) {
            categoryMetrics.forEach(metric => {
              if (metric?.name) {
                availableMetrics.add(metric.name.toLowerCase());
              }
            });
          }
        });
  
        if (availableMetrics.size > 0) {
          setForecastableMetrics(Array.from(availableMetrics));
        }
      }
    } catch (error) {
      console.warn('Error fetching forecast metrics, using defaults:', error);
    }
  }, [router]);

  const scaleParams = useMemo(() => ({
    scope,
    resolution,
    isForecast,
    selectedMetric,
  }), [scope, resolution, isForecast, selectedMetric]);

  
  const fetchMetricCards = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }
  
      let url = '';
      if (isForecast && selectedMetric && metricIds[selectedMetric.toLowerCase()]) {
        url = `${API_URL}/metrics/metric_forecast?metric_id=${metricIds[selectedMetric.toLowerCase()]}&forecast_duration=${scope}&resolution=${resolution}`;
      } else {
        url = `${API_URL}/metrics/metric_cards?scope=${scope}&resolution=${resolution}`;
      }
  
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${data.error || response.statusText}`);
      }
  
      const transformedData = isForecast ? transformForecastData(data) : transformCurrentData(data);
      
      if (Object.keys(transformedData).length > 0) {
        setMetricCards(transformedData);
      } else {
        showToast({
          title: "Warning",
          description: "No metrics data available",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
      if (isForecast) {
        setIsForecast(false);
        showToast({
          title: "Forecast Unavailable",
          description: "Unable to load forecast data. Showing current data instead.",
          variant: "destructive",
        });
        // Retry with current data
        await fetchMetricCards();
      } else {
        showToast({
          title: "Error",
          description: "Failed to load metrics data",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [forecastableMetrics, router, showToast, scope, resolution, isForecast, selectedMetric, metricIds]);

  useEffect(() => {
    const fetchMetricIds = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;
  
      try {
        const response = await fetch(`${API_URL}/metrics/available_forecast_metrics`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        });
  
        if (response.ok) {
          const data = await response.json();
          const ids: Record<string, number> = {};
          
          // Flatten all metrics from all categories
          Object.values(data.metrics).forEach((categoryMetrics: any) => {
            categoryMetrics.forEach((metric: any) => {
              ids[metric.name.toLowerCase()] = metric.id;
            });
          });
          
          setMetricIds(ids);
        }
      } catch (error) {
        console.error('Error fetching metric IDs:', error);
      }
    };
  
    fetchMetricIds();
  }, []);

  useEffect(() => {
    if (initializationRef.current) return; // Skip if already initialized
    
    const initialize = async () => {
      initializationRef.current = true;
      setLoading(true);
      try {
        // Fetch both in parallel
        await Promise.all([
          fetchForecastMetrics(),
          fetchMetricCards()
        ]);
        setIsInitialized(true);
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []); 
  
  useEffect(() => {
    if (!initializationRef.current) return; // Skip if not initialized yet
    if (isInitialized) {
      fetchMetricCards();
    }
  }, [scope, resolution, isForecast, selectedMetric]);
  
  const handleMetricSelect = (metric: string) => {
    setSelectedMetric(selectedMetric === metric ? null : metric);
    setIsForecast(false);
  };

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
          {selectedMetric ? (
            <div className="flex items-center gap-4">
              <button 
                onClick={() => handleMetricSelect(selectedMetric)} // This will toggle it off
                className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Overview
              </button>
            </div>
          ) : (
            <h1 className="text-2xl font-bold">Metrics Overview</h1>
          )}
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Star className="h-4 w-4 text-primary" />
              <span>Forecast available</span>
            </div>
            {selectedMetric && forecastableMetrics.includes(selectedMetric.toLowerCase()) && (
              <div className="flex bg-secondary rounded-lg p-1">
                <button
                  className={`px-3 py-1 rounded-md text-sm ${!isForecast ? 'bg-primary text-primary-foreground' : ''}`}
                  onClick={() => setIsForecast(false)}
                >
                  Current
                </button>
                <button
                  className={`px-3 py-1 rounded-md text-sm ${isForecast ? 'bg-primary text-primary-foreground' : ''}`}
                  onClick={() => setIsForecast(true)}
                >
                  Forecast
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {Object.entries(metricCards || {}).map(([key, data]) => {
            const isSelected = selectedMetric === key;
            
            return (
              <div 
                key={key}
                className={`${
                  isSelected 
                    ? 'col-span-full row-start-1'
                    : selectedMetric 
                      ? 'col-span-1' 
                      : 'col-span-1'
                }`}
              >
                <MetricCard
                  title={key.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                  data={data}
                  onExpand={() => handleMetricSelect(key)}
                  isExpanded={isSelected}
                  forecastEnabled={forecastableMetrics.includes(key.toLowerCase())}
                  isForecast={isForecast}
                  scope={scope}
                  resolution={resolution}
                  onScopeChange={setScope}
                  onResolutionChange={setResolution}
                  scopeOptions={isForecast ? forecastScopeOptions : currentScopeOptions}
                  resolutionOptions={resolutionOptions}
                  metricId={metricIds[key.toLowerCase()]}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MetricsPage;