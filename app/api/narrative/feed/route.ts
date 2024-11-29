import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/config';

export async function GET(request) {
  console.log('API route called');
  
  try {
    // Log the API URL
    console.log('Using API URL:', API_URL);

    // Get and log the auth header
    const authHeader = request.headers.get('authorization');
    console.log('Auth header:', authHeader ? 'Present' : 'Missing');

    if (!authHeader) {
      console.log('No auth header found');
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    console.log('Making request to backend');
    const response = await fetch(`${API_URL}/narrative/feed`, {
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json'
      }
    });

    console.log('Backend response status:', response.status);

    const data = await response.json();
    console.log('Backend response data shape:', {
      hasArticles: !!data.articles,
      articleCount: data.articles?.length || 0
    });

    if (!response.ok) {
      console.log('Backend request failed:', response.status);
      return NextResponse.json(
        { error: 'Failed to fetch narratives from backend' },
        { status: response.status }
      );
    }

    console.log('Successfully returning data to client');
    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}