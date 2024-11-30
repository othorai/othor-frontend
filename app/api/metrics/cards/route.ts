// app/api/metrics/cards/route.ts
import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/config';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope') || 'this_year';
    const resolution = searchParams.get('resolution') || 'monthly';
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${API_URL}/metrics/metric_cards`, {
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

    // Transform API response to match frontend expectations
    const transformedData = Object.entries(data.metrics).reduce((acc, [key, metric]: [string, any]) => {
      acc[key] = {
        percentage_change: metric.change.percentage,
        start_date: data.metadata.start_date,
        end_date: data.metadata.end_date,
        start_amount: metric.previous_value,
        end_amount: metric.current_value,
        trend: metric.change.percentage >= 0 ? 'up' : 'down',
        graph_data: metric.trend_data.map((point: any) => ({
          date: point.date,
          value: point.value,
          ma3: point.ma3,
          ma7: point.ma7
        }))
      };
      return acc;
    }, {});

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error in metrics API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics data' },
      { status: 500 }
    );
  }
}