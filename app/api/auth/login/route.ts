import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/config';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('Login attempt for:', email);

    // Create form-urlencoded body
    const formBody = `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;

    console.log('Making backend request to:', `${API_URL}/authorization/login`);

    const response = await fetch(`${API_URL}/authorization/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: formBody
    });

    console.log('Backend response status:', response.status);

    // Get response data
    const responseText = await response.text();
    console.log('Raw response:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Parsed response data');
    } catch (e) {
      console.error('Failed to parse response:', e);
      return NextResponse.json(
        { detail: 'Invalid response from server' },
        { status: 500 }
      );
    }

    if (!response.ok) {
      console.log('Login failed:', data);
      return NextResponse.json(
        { detail: data.detail || 'Authentication failed' },
        { status: response.status }
      );
    }

    // Ensure we have an access token
    if (!data.access_token) {
      console.error('No access token in response');
      return NextResponse.json(
        { detail: 'Invalid response from authentication server' },
        { status: 500 }
      );
    }

    // Create response with token
    const authResponse = NextResponse.json({
      access_token: data.access_token,
      token_type: data.token_type
    });

    // Set token in cookie as backup
    authResponse.cookies.set('authToken', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    console.log('Login successful, returning response');
    return authResponse;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { detail: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}