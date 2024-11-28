// app/api/narrative/feed/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://backend-authorization-gatewa-alb-1180704430.eu-north-1.elb.amazonaws.com';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization');
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const response = await fetch(
      `${API_URL}/narrative/feed${date ? `?date=${date}` : ''}`,
      {
        headers: {
          'Authorization': token,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { message: error.detail || 'Failed to fetch narratives' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}