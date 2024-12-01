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

    const response = await fetch(`${API_URL}/metrics/single_metric_card`, {
      headers: {
        'Authorization': authHeader,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in single metric API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metric data' },
      { status: 500 }
    );
  }
}