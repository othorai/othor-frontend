// app/api/metrics/cards/metric_forecast/available/route.ts
import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/config';

const DEFAULT_FORECAST_METRICS = {
  metrics: {
    financial: [
      { 
        name: 'revenue', 
        forecast_settings: { 
          max_forecast_period: 'year',
          available_resolutions: ['daily', 'weekly', 'monthly']
        }
      },
      { 
        name: 'costs', 
        forecast_settings: {
          max_forecast_period: 'year',
          available_resolutions: ['daily', 'weekly', 'monthly']
        }
      }
    ],
    operational: [
      { 
        name: 'units_sold', 
        forecast_settings: {
          max_forecast_period: 'quarter',
          available_resolutions: ['daily', 'weekly']
        }
      },
      { 
        name: 'repeat_customers', 
        forecast_settings: {
          max_forecast_period: 'month',
          available_resolutions: ['daily', 'weekly']
        }
      }
    ]
  }
};

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (process.env.NODE_ENV === 'development') {
      // In development, always return default metrics
      return NextResponse.json(DEFAULT_FORECAST_METRICS);
    }

    try {
      const response = await fetch(`${API_URL}/metrics/available_forecast_metrics`, {
        headers: {
          'Authorization': authHeader,
        },
        cache: 'no-store'
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch (error) {
      console.warn('Error fetching from API, using defaults:', error);
    }

    // Return defaults if API fails
    return NextResponse.json(DEFAULT_FORECAST_METRICS);

  } catch (error) {
    console.error('Error in available forecast metrics:', error);
    return NextResponse.json(DEFAULT_FORECAST_METRICS);
  }
}