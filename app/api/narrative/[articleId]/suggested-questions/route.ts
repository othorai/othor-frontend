// app/api/narrative/[articleId]/suggested-questions/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { API_URL } from '@/lib/config';

export async function GET(
  request: NextRequest,
  { params }: { params: { articleId: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(
      `${API_URL}/narrative/article/${params.articleId}/suggested_questions`,
      {
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch questions' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching suggested questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}