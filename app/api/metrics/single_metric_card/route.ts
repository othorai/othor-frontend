// app/api/metrics/single_metric_card/route.ts
import { NextResponse } from 'next/server';

interface MetricPoint {
  date: string;
  value: number;
  trend?: string;
  ma3?: number;
  ma7?: number;
}

interface MetricResponse {
  metric_card: {
    percentage_change: number;
    trend: 'up' | 'down';
    start_date: string;
    end_date: string;
    start_amount: number;
    end_amount: number;
    graph_data: MetricPoint[];
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric');
    const scope = searchParams.get('scope');
    const resolution = searchParams.get('resolution');

    // Validate required parameters
    if (!metric || !scope || !resolution) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Mock data generation based on parameters
    const currentDate = new Date();
    const graphData: MetricPoint[] = [];
    let startDate = new Date();
    let numPoints = 12;

    // Adjust date range based on scope
    switch (scope) {
      case 'this_week':
        startDate.setDate(currentDate.getDate() - 7);
        numPoints = 7;
        break;
      case 'this_month':
        startDate.setMonth(currentDate.getMonth(), 1);
        numPoints = resolution === 'weekly' ? 4 : 30;
        break;
      case 'this_quarter':
        startDate.setMonth(currentDate.getMonth() - 3);
        numPoints = resolution === 'monthly' ? 3 : 12;
        break;
      case 'this_year':
        startDate.setFullYear(currentDate.getFullYear(), 0, 1);
        numPoints = resolution === 'monthly' ? 12 : 52;
        break;
      default:
        startDate.setMonth(currentDate.getMonth() - 12);
    }

    // Generate sample data points
    let baseValue = 1000;
    for (let i = 0; i < numPoints; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + (i * (resolution === 'monthly' ? 30 : resolution === 'weekly' ? 7 : 1)));
      
      const randomChange = (Math.random() - 0.5) * 100;
      baseValue += randomChange;
      
      graphData.push({
        date: date.toISOString(),
        value: Math.max(0, baseValue),
        trend: randomChange >= 0 ? 'up' : 'down',
        ma3: baseValue + (Math.random() - 0.5) * 50,
        ma7: baseValue + (Math.random() - 0.5) * 50
      });
    }

    const response: MetricResponse = {
      metric_card: {
        percentage_change: ((graphData[graphData.length - 1].value - graphData[0].value) / graphData[0].value) * 100,
        trend: graphData[graphData.length - 1].value >= graphData[0].value ? 'up' : 'down',
        start_date: graphData[0].date,
        end_date: graphData[graphData.length - 1].date,
        start_amount: graphData[0].value,
        end_amount: graphData[graphData.length - 1].value,
        graph_data: graphData
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error processing metric request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metric data' },
      { status: 500 }
    );
  }
}