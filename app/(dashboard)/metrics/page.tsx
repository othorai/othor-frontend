'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { Star } from 'lucide-react';
import MetricCard from '@/components/metrics/MetricCard';
import type { MetricData } from '@/components/metrics/MetricCard';

function MetricsPage() {
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
      console.log('API Response:', data);
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

  useEffect(() => {
    console.log('Metric Cards Updated:', metricCards);
  }, [metricCards]);

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

export default MetricsPage;