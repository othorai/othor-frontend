// context/MetricsContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MetricData } from '@/components/metrics/MetricCard';
import { format } from 'date-fns';

interface MetricsContextType {
  metricCards: Record<string, MetricData>;
  setMetricCards: (cards: Record<string, MetricData>) => void;
  selectedMetric: string | null;
  setSelectedMetric: (metric: string | null) => void;
  scope: string;
  setScope: (scope: string) => void;
  resolution: string;
  setResolution: (resolution: string) => void;
  isForecast: boolean;
  setIsForecast: (isForecast: boolean) => void;
  forecastableMetrics: string[];
  setForecastableMetrics: (metrics: string[]) => void;
  metricIds: Record<string, number>;
  setMetricIds: (ids: Record<string, number>) => void;
  lastFetchDate: string | null;
  setLastFetchDate: (date: string | null) => void;
  clearCache: () => void;
}

const STORAGE_KEY = 'metrics_context';

interface StoredState {
  metricCards: Record<string, MetricData>;
  selectedMetric: string | null;
  scope: string;
  resolution: string;
  isForecast: boolean;
  forecastableMetrics: string[];
  metricIds: Record<string, number>;
  lastFetchDate: string | null;
}

const MetricsContext = createContext<MetricsContextType | undefined>(undefined);

export function MetricsProvider({ children }: { children: React.ReactNode }) {
  // Initialize state with empty values
  const [metricCards, setMetricCards] = useState<Record<string, MetricData>>({});
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [scope, setScope] = useState('this_year');
  const [resolution, setResolution] = useState('monthly');
  const [isForecast, setIsForecast] = useState(false);
  const [forecastableMetrics, setForecastableMetrics] = useState<string[]>([]);
  const [metricIds, setMetricIds] = useState<Record<string, number>>({});
  const [lastFetchDate, setLastFetchDate] = useState<string | null>(null);

  // Load state from localStorage on mount
  useEffect(() => {
    const storedState = localStorage.getItem(STORAGE_KEY);
    if (storedState) {
      try {
        const parsedState = JSON.parse(storedState) as StoredState;
        setMetricCards(parsedState.metricCards);
        setSelectedMetric(parsedState.selectedMetric);
        setScope(parsedState.scope);
        setResolution(parsedState.resolution);
        setIsForecast(parsedState.isForecast);
        setForecastableMetrics(parsedState.forecastableMetrics);
        setMetricIds(parsedState.metricIds);
        setLastFetchDate(parsedState.lastFetchDate);
      } catch (error) {
        console.error('Error parsing stored metrics state:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const state: StoredState = {
      metricCards,
      selectedMetric,
      scope,
      resolution,
      isForecast,
      forecastableMetrics,
      metricIds,
      lastFetchDate,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [
    metricCards,
    selectedMetric,
    scope,
    resolution,
    isForecast,
    forecastableMetrics,
    metricIds,
    lastFetchDate,
  ]);

  const clearCache = useCallback(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    // Only clear if the last fetch was not today
    if (lastFetchDate !== today) {
      setMetricCards({});
      setSelectedMetric(null);
      setScope('this_year');
      setResolution('monthly');
      setIsForecast(false);
      setLastFetchDate(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [lastFetchDate]);

  // Add event listener for storage changes in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const newState = JSON.parse(e.newValue) as StoredState;
          setMetricCards(newState.metricCards);
          setSelectedMetric(newState.selectedMetric);
          setScope(newState.scope);
          setResolution(newState.resolution);
          setIsForecast(newState.isForecast);
          setForecastableMetrics(newState.forecastableMetrics);
          setMetricIds(newState.metricIds);
          setLastFetchDate(newState.lastFetchDate);
        } catch (error) {
          console.error('Error parsing storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <MetricsContext.Provider
      value={{
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
        clearCache,
      }}
    >
      {children}
    </MetricsContext.Provider>
  );
}

export function useMetrics() {
  const context = useContext(MetricsContext);
  if (context === undefined) {
    throw new Error('useMetrics must be used within a MetricsProvider');
  }
  return context;
}