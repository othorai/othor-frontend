// app/api/metrics/single_metric_card/route.ts
import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/config';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric');
    const scope = searchParams.get('scope') || 'this_year';
    const resolution = searchParams.get('resolution') || 'monthly';
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update the API URL to use /metrics directly
    const apiUrl = `${API_URL}/metrics?scope=${scope}&resolution=${resolution}`;

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': authHeader,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Find the specific metric data from the response
    const metricData = data.metrics[metric];
    if (!metricData) {
      throw new Error('Metric not found');
    }

    // Transform the data to match the expected format
    const transformedData = {
      percentage_change: metricData.change.percentage,
      start_date: data.metadata.start_date,
      end_date: data.metadata.end_date,
      start_amount: metricData.previous_value,
      end_amount: metricData.current_value,
      trend: metricData.change.percentage >= 0 ? 'up' : 'down',
      graph_data: metricData.trend_data.map((point: any) => ({
        date: point.date,
        value: point.value,
        ma3: point.ma3,
        ma7: point.ma7
      }))
    };

    return NextResponse.json(transformedData);

  } catch (error) {
    console.error('Error in metrics API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metric data' },
      { status: 500 }
    );
  }
}