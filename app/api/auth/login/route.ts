import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/config';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const formBody = `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;

    console.log('Attempting login to:', `${API_URL}/authorization/login`);

    const response = await fetch(`${API_URL}/authorization/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: formBody
    });

    const data = await response.json();
    console.log('Login response status:', response.status);

    if (!response.ok) {
      return NextResponse.json(
        { detail: data.detail || 'Authentication failed' },
        { status: response.status }
      );
    }

    // Ensure we have an access token
    if (!data.access_token) {
      return NextResponse.json(
        { detail: 'Invalid response from authentication server' },
        { status: 500 }
      );
    }

    const authResponse = NextResponse.json(data);
    authResponse.cookies.set('authToken', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    return authResponse;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { detail: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}