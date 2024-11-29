// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/config';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Create form-urlencoded body exactly like React Native version
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
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { detail: 'A network error occurred' },
      { status: 500 }
    );
  }
}