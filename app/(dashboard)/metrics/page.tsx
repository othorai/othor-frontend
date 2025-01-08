// app/(dashboard)/metrics/page.tsx
'use client';

import { useState, useEffect, useCallback , useMemo, useRef} from 'react';
import { Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { Star } from 'lucide-react';
import MetricCard from '@/components/metrics/MetricCard';
import type { MetricData } from '@/components/metrics/MetricCard';
import { ChevronLeft } from 'lucide-react'; 
import { API_URL } from '@/lib/config';
import { useMetrics } from '@/context/MetricsContext';
import { format } from 'date-fns';
import { Card } from "@/components/ui/card";


const currentScopeOptions = [
  { label: 'Past 7 Days', value: 'past_7_days' },
  { label: 'Past 30 Days', value: 'past_30_days' },
  { label: 'Past 4 Months', value: 'past_4_months' },
  { label: 'Past 12 Months', value: 'past_12_months' },
];

const forecastScopeOptions = [
  { label: 'Next 7 Days', value: 'next_7_days' },
  { label: 'Next 30 Days', value: 'next_30_days' },
  { label: 'Next 4 Months', value: 'next_4_months' },
  { label: 'Next 12 Months', value: 'next_12_months' },
];

const resolutionOptions = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

interface LastFetchParams {
  scope: string;
  resolution: string;
  isForecast: boolean;
  wasActiveMetric: boolean;
}

const DEFAULT_FORECAST_METRICS = ['revenue', 'costs', 'units_sold', 'repeat_customers'];

function MetricsPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast: showToast } = useToast();
  const initializationRef = useRef(false);
  const [forecastMetricsLoading, setForecastMetricsLoading] = useState(true);
  
  const {
    metricCards,
    setMetricCards,
    selectedMetric,
    setSelectedMetric,
    scope,
    setScope,
    resolution,
    setResolution,
    isForecast,
    setIsForecast,
    forecastableMetrics,
    setForecastableMetrics,
    metricIds,
    setMetricIds,
    lastFetchDate,
    setLastFetchDate,
  } = useMetrics();

  const lastFetchRef = useRef<LastFetchParams>({
    scope: 'this_week',
    resolution: 'daily',
    isForecast: false,
    wasActiveMetric: false
  });

  const normalizeName = (name: string): string => {
    return name.toLowerCase().replace(/[\s-]/g, '_');
  };

  const transformCurrentData = (data: any): Record<string, MetricData> => {
    const transformed: Record<string, MetricData> = {};
    
    if (data?.metrics && Object.keys(data.metrics).length > 0) {
      Object.entries(data.metrics).forEach(([key, metric]: [string, any]) => {
        transformed[key] = {
          percentage_change: metric.change?.percentage ?? 0,
          trend: (metric.change?.percentage ?? 0) >= 0 ? 'up' : 'down',
          start_date: data.metadata?.start_date ?? new Date().toISOString(),
          end_date: data.metadata?.end_date ?? new Date().toISOString(),
          start_amount: metric.previous_value ?? 0,
          end_amount: metric.current_value ?? 0,
          category: metric.category ?? 'Uncategorized',
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
    
    if (data?.forecast_points?.length > 0) {
      // For single metric forecast response
      transformed[data.metric_name] = {
        percentage_change: ((data.forecast_points[data.forecast_points.length - 1].value - 
                           data.forecast_points[0].value) / data.forecast_points[0].value * 100) || 0,
        trend: 'up',  // Will be determined by percentage change
        start_date: data.metadata?.start_date || data.forecast_points[0].date,
        end_date: data.metadata?.end_date || data.forecast_points[data.forecast_points.length - 1].date,
        start_amount: data.forecast_points[0].value,
        end_amount: data.forecast_points[data.forecast_points.length - 1].value,
        category: data.metadata?.category || metricCards[data.metric_name]?.category || 'Uncategorized',
        graph_data: data.forecast_points.map((point: any) => ({
          date: point.date,
          value: point.value,
          confidence_interval: point.confidence_interval
        }))
      };
  
      // Update trend based on percentage change
      transformed[data.metric_name].trend = 
        transformed[data.metric_name].percentage_change >= 0 ? 'up' : 'down';
    }
    else if (data?.forecasts) {
      // For multiple metrics forecast response
      Object.entries(data.forecasts).forEach(([key, forecast]: [string, any]) => {
        const forecastPoints = forecast.forecast_points || [];
        if (forecastPoints.length > 0) {
          const firstPoint = forecastPoints[0];
          const lastPoint = forecastPoints[forecastPoints.length - 1];
          const percentageChange = ((lastPoint.value - firstPoint.value) / firstPoint.value * 100) || 0;
  
          transformed[key] = {
            percentage_change: percentageChange,
            trend: percentageChange >= 0 ? 'up' : 'down',
            start_date: forecast.metadata?.start_date || firstPoint.date,
            end_date: forecast.metadata?.end_date || lastPoint.date,
            start_amount: firstPoint.value,
            end_amount: lastPoint.value,
            category: forecast.metadata?.category || metricCards[key]?.category || 'Uncategorized',
            graph_data: forecastPoints.map((point: any) => ({
              date: point.date,
              value: point.value,
              confidence_interval: point.confidence_interval
            }))
          };
        }
      });
    }
    
    return transformed;
  };
  

  const fetchForecastMetrics = useCallback(async () => {
    setForecastMetricsLoading(true);
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
        setForecastableMetrics(DEFAULT_FORECAST_METRICS);
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
      setForecastableMetrics(DEFAULT_FORECAST_METRICS);
    } finally {
      setForecastMetricsLoading(false);
    }
  }, [router]);

  const scaleParams = useMemo(() => ({
    scope,
    resolution,
    isForecast,
    selectedMetric,
  }), [scope, resolution, isForecast, selectedMetric]);

  const handleFetchMetrics = useCallback(
    async (
      currentScope: string,
      currentResolution: string,
      isForecasting: boolean,
      currentMetric: string | null
    ) => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        const today = format(new Date(), 'yyyy-MM-dd');
  
        if (!token) {
          router.push('/login');
          return;
        }
  
        if (isForecasting && !currentMetric) {
          setLoading(false);
          return;
        }
  
        let url = '';
        if (isForecasting && currentMetric && metricIds[currentMetric.toLowerCase()]) {
          url = `${API_URL}/metrics/metric_forecast?metric_id=${
            metricIds[currentMetric.toLowerCase()]
          }&forecast_duration=${currentScope}&resolution=${currentResolution}`;
  
          const currentCategory = metricCards[currentMetric]?.category;
          if (currentCategory) {
            url += `&category=${encodeURIComponent(currentCategory)}`;
          }
        } else {
          url = `${API_URL}/metrics/metric_cards?scope=${currentScope}&resolution=${currentResolution}`;
        }
  
        console.log('Fetching metrics from:', url);
  
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
  
        const data = await response.json();
        if (!response.ok) {
          throw new Error(`Failed to fetch metrics: ${data.error || response.statusText}`);
        }
  
        if (isForecasting && currentMetric) {
          data.metric_name = currentMetric;
          data.metadata = {
            ...data.metadata,
            category: metricCards[currentMetric]?.category || 'Uncategorized'
          };
          
          const transformedData = transformForecastData(data);
          
          // Create new state object directly
          const newState: Record<string, MetricData> = {
            ...metricCards,
            [currentMetric]: {
              ...(metricCards[currentMetric] || {}),
              ...transformedData[currentMetric],
              category: metricCards[currentMetric]?.category || 
                       transformedData[currentMetric]?.category || 
                       'Uncategorized'
            }
          };
          
          // Set the new state directly
          setMetricCards(newState);
        } else {
          const transformedData = transformCurrentData(data);
          setMetricCards(transformedData);
        }
  
        lastFetchRef.current = {
          scope: currentScope,
          resolution: currentResolution,
          isForecast: isForecasting,
          wasActiveMetric: lastFetchRef.current.wasActiveMetric
        };
  
        if (!isForecasting) {
          setLastFetchDate(today);
        }
      } catch (error) {
        console.error('Error fetching metrics:', error);
        showToast({
          title: "Error",
          description: "Failed to load metrics data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [metricIds, router, showToast, setMetricCards, lastFetchDate, metricCards]
  );

  interface MetricApiResponse {
    metrics: {
      [category: string]: Array<{
        id: number;
        name: string;
        visualization_type: string;
        business_context: string;
        source: string;
        confidence_score: number;
        calculation: string;
        aggregation_period: string;
        data_points: number;
        forecast_settings: {
          min_historical_days: number;
          recommended_forecast_period: string;
          max_forecast_horizon: number;
        };
      }>;
    };
    categories: string[];
    metadata: {
      total_metrics_analyzed: number;
      forecastable_metrics_count: number;
      minimum_required_points: number;
      timestamp: string;
    };
  }
  
  const initializeMetricData = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }
  
    if (forecastableMetrics.length === 0 || Object.keys(metricIds).length === 0) {
      try {
        const response = await fetch(`${API_URL}/metrics/available_forecast_metrics`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          console.warn('Failed to fetch forecast metrics, using defaults');
          setForecastableMetrics(DEFAULT_FORECAST_METRICS);
          return;
        }
  
        const data = await response.json() as MetricApiResponse;
        if (data?.metrics) {
          const availableMetrics = new Set<string>();
          const ids: Record<string, number> = {};
          
          Object.values(data.metrics).forEach((categoryMetrics) => {
            categoryMetrics.forEach(metric => {
              if (metric?.name) {
                const normalizedName = normalizeName(metric.name);
                availableMetrics.add(normalizedName);
                ids[normalizedName] = metric.id;
              }
            });
          });
  
          if (availableMetrics.size > 0) {
            setForecastableMetrics(Array.from(availableMetrics) as string[]);
            setMetricIds(ids);
          }
        }
      } catch (error) {
        console.warn('Error fetching forecast metrics, using defaults:', error);
        setForecastableMetrics(DEFAULT_FORECAST_METRICS);
      }
    }
  }, [router, forecastableMetrics.length, metricIds, setForecastableMetrics, setMetricIds]);

  
  useEffect(() => {
    if (!isInitialized) return;
    
    const lastFetch = lastFetchRef.current;
    const paramsChanged = 
      scope !== lastFetch.scope ||
      resolution !== lastFetch.resolution;
    const forecastChanged = isForecast !== lastFetch.isForecast;
  
    // Only fetch if parameters changed OR switching between forecast and current
    if (paramsChanged || (forecastChanged && selectedMetric)) {
      console.log('Fetching metrics due to:', { 
        paramsChanged, 
        forecastChanged, 
        scope, 
        resolution, 
        isForecast, 
        selectedMetric 
      });
      handleFetchMetrics(scope, resolution, isForecast, selectedMetric);
    }
  }, [scope, resolution, selectedMetric, isInitialized, handleFetchMetrics]); 
  
  useEffect(() => {
    if (initializationRef.current) return;
    
    const initialize = async () => {
      initializationRef.current = true;
      setLoading(true);
      try {
        const today = format(new Date(), 'yyyy-MM-dd');
        
        // Check if we already have data for today
        if (lastFetchDate === today && Object.keys(metricCards).length > 0) {
          setIsInitialized(true);
          setLoading(false);
          setForecastMetricsLoading(false); // Add this line
          return;
        }
  
        // Only fetch if we don't have today's data
        await Promise.all([
          initializeMetricData(),
          handleFetchMetrics(scope, resolution, isForecast, selectedMetric)
        ]);
        
        setLastFetchDate(today);
        setIsInitialized(true);
        setForecastMetricsLoading(false); 
      } catch (error) {
        console.error('Initialization error:', error);
        setForecastMetricsLoading(false); 
      } finally {
        setLoading(false);
      }
    };
  
    initialize();
  }, []);

  const handleMetricSelect = useCallback((metric: string) => {
    if (selectedMetric === metric) {
      setSelectedMetric(null);
    } else {
      setSelectedMetric(metric);
    }
    setIsForecast(false);
  }, [selectedMetric]);

  const groupedMetrics = useMemo(() => {
    const grouped: Record<string, Array<{ key: string; data: MetricData }>> = {};
    
    // First group the metrics by category
    Object.entries(metricCards || {}).forEach(([key, data]) => {
      const category = data.category || 'Uncategorized';
      
      if (!grouped[category]) {
        grouped[category] = [];
      }
      
      grouped[category].push({ key, data });
    });
    
    // Sort metrics within each category by end_amount (descending)
    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => b.data.end_amount - a.data.end_amount);
    });
    
    // Sort categories by number of metrics (descending)
    const sortedGrouped: Record<string, Array<{ key: string; data: MetricData }>> = {};
    Object.entries(grouped)
      .sort(([, metricsA], [, metricsB]) => metricsB.length - metricsA.length)
      .forEach(([category, metrics]) => {
        sortedGrouped[category] = metrics;
      });
    
    return sortedGrouped;
  }, [metricCards]);

  if (loading || forecastMetricsLoading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-screen">
        <div className="space-y-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">
            {loading && forecastMetricsLoading 
              ? "Loading metrics..."
              : loading 
                ? "Loading metrics data..." 
                : "Loading forecast metrics..."}
          </p>
        </div>
      </div>
    );
  }

  const hasNoDataSources = !metricCards || Object.keys(metricCards).length === 0;

  if (hasNoDataSources) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-2xl p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            No data sources connected
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Please connect a data source to view metrics
          </p>
          <button 
            onClick={() => router.push('/settings')} 
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Connect Data Source
          </button>
        </Card>
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
                onClick={() => handleMetricSelect(selectedMetric)}
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

        <div className="space-y-8">
          {Object.entries(groupedMetrics).map(([category, metrics]) => (
            <div key={category} className="space-y-4">
              <h2 className="text-xl font-semibold text-primary">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {metrics.map(({ key, data }) => {
                  const isSelected = selectedMetric === key;
                  const normalizedKey = normalizeName(key);
                  const isForcastable = forecastableMetrics.includes(normalizedKey);
                  
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
                        forecastEnabled={isForcastable}
                        isForecast={isForecast}
                        scope={scope}
                        resolution={resolution}
                        onScopeChange={setScope}
                        onResolutionChange={setResolution}
                        scopeOptions={isForecast ? forecastScopeOptions : currentScopeOptions}
                        resolutionOptions={resolutionOptions}
                        metricId={metricIds[normalizedKey]}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MetricsPage;