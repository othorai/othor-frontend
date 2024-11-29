import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/config';

export async function GET(request: Request) {
  try {
    // Get token from request header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    console.log('Fetching narratives from API...');
    const response = await fetch(`${API_URL}/narrative/feed`, {
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('API response not ok:', response.status);
      return NextResponse.json(
        { error: 'Failed to fetch narratives' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('API response received');

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in narrative feed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch narratives' },
      { status: 500 }
    );
  }
}