// app/api/metrics/cards/route.ts
import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/config';

interface MetricData {
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope') || 'this_year';
    const resolution = searchParams.get('resolution') || 'monthly';
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In development, return mock data for testing
    if (process.env.NODE_ENV === 'development') {
      const mockData = generateMockData(scope, resolution);
      return NextResponse.json(mockData);
    }

    const response = await fetch(`${API_URL}/metrics/metric_cards?scope=${scope}&resolution=${resolution}`, {
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
    console.error('Error in metrics API:', error);
    // Return mock data in case of error during development
    if (process.env.NODE_ENV === 'development') {
      const mockData = generateMockData('this_year', 'monthly');
      return NextResponse.json(mockData);
    }
    return NextResponse.json(
      { error: 'Failed to fetch metrics data' },
      { status: 500 }
    );
  }
}

function generateMockData(scope: string, resolution: string) {
  const metrics = ['revenue', 'costs', 'units_sold', 'repeat_customers'];
  const currentDate = new Date();
  const mockData: any = {
    metrics: {},
    metadata: {
      start_date: new Date(currentDate.getFullYear(), 0, 1).toISOString(),
      end_date: currentDate.toISOString()
    }
  };

  metrics.forEach(metric => {
    const baseValue = Math.random() * 10000;
    const trendData = [];
    let numPoints = 12;

    // Adjust number of points based on scope and resolution
    switch (scope) {
      case 'this_week':
        numPoints = 7;
        break;
      case 'this_month':
        numPoints = resolution === 'weekly' ? 4 : 30;
        break;
      case 'this_quarter':
        numPoints = resolution === 'monthly' ? 3 : 12;
        break;
      case 'this_year':
        numPoints = resolution === 'monthly' ? 12 : 52;
        break;
    }

    let currentValue = baseValue;
    for (let i = 0; i < numPoints; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (numPoints - i));
      
      const change = (Math.random() - 0.3) * 1000; // Slightly biased towards growth
      currentValue += change;
      
      trendData.push({
        date: date.toISOString(),
        value: Math.max(0, currentValue),
        trend: change >= 0 ? 'up' : 'down',
        ma3: Math.max(0, currentValue + (Math.random() - 0.5) * 500),
        ma7: Math.max(0, currentValue + (Math.random() - 0.5) * 500)
      });
    }

    mockData.metrics[metric] = {
      change: {
        percentage: ((currentValue - baseValue) / baseValue) * 100
      },
      previous_value: baseValue,
      current_value: currentValue,
      trend_data: trendData
    };
  });

  return mockData;
}