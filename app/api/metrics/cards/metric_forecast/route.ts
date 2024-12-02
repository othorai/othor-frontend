// app/api/metrics/cards/metric_forecast/route.ts
import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/config';

interface ForecastResponse {
  forecast: {
    percentage_change: number;
    trend: 'up' | 'down';
    start_date: string;
    end_date: string;
    start_amount: number;
    end_amount: number;
    graph_data: Array<{
      date: string;
      value: number;
    }>;
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric');
    const scope = searchParams.get('scope') || 'next_year';
    const resolution = searchParams.get('resolution') || 'monthly';
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // If we're in development or testing, return mock data
    if (process.env.NODE_ENV === 'development') {
      const currentDate = new Date();
      const graphData = [];
      let startDate = new Date();
      let numPoints = 12;

      // Adjust date range based on scope
      switch (scope) {
        case 'next_week':
          startDate = new Date(currentDate);
          numPoints = 7;
          break;
        case 'next_month':
          startDate = new Date(currentDate);
          numPoints = resolution === 'weekly' ? 4 : 30;
          break;
        case 'next_quarter':
          startDate = new Date(currentDate);
          numPoints = resolution === 'monthly' ? 3 : 12;
          break;
        case 'next_year':
          startDate = new Date(currentDate);
          numPoints = resolution === 'monthly' ? 12 : 52;
          break;
      }

      let baseValue = 1000;
      for (let i = 0; i < numPoints; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + (i * (resolution === 'monthly' ? 30 : resolution === 'weekly' ? 7 : 1)));
        
        const randomChange = (Math.random() - 0.3) * 100; // Slightly biased towards growth
        baseValue += randomChange;
        
        graphData.push({
          date: date.toISOString(),
          value: Math.max(0, baseValue)
        });
      }

      const mockResponse: ForecastResponse = {
        forecast: {
          percentage_change: ((graphData[graphData.length - 1].value - graphData[0].value) / graphData[0].value) * 100,
          trend: graphData[graphData.length - 1].value >= graphData[0].value ? 'up' : 'down',
          start_date: graphData[0].date,
          end_date: graphData[graphData.length - 1].date,
          start_amount: graphData[0].value,
          end_amount: graphData[graphData.length - 1].value,
          graph_data: graphData
        }
      };

      return NextResponse.json(mockResponse);
    }

    // In production, forward to actual API
    const response = await fetch(`${API_URL}/metrics/metric_forecast?metric=${metric}&scope=${scope}&resolution=${resolution}`, {
      headers: {
        'Authorization': authHeader,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in forecast API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch forecast data' },
      { status: 500 }
    );
  }
}