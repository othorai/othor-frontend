import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const authResponse = await authMiddleware(req);
  if (authResponse) return authResponse;

  const token = req.headers.get('Authorization')?.split(' ')[1];
  
  try {
    const response = await fetch(`${process.env.API_URL}/authorization/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    const userData = await response.json();
    return NextResponse.json(userData);
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}