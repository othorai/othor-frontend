import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/config';

export async function GET(request) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    console.log('API Route - Auth header received:', authHeader ? 'Yes' : 'No');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('API Route - Invalid auth header format');
      return NextResponse.json({ error: 'Invalid authorization header' }, { status: 401 });
    }

    // Forward the request to the backend
    console.log('API Route - Forwarding request to:', `${API_URL}/narrative/feed`);
    
    const response = await fetch(`${API_URL}/narrative/feed`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
      },
    });

    console.log('API Route - Backend response status:', response.status);

    if (!response.ok) {
      console.log('API Route - Backend request failed');
      return NextResponse.json(
        { error: 'Backend request failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('API Route - Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}