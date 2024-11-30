import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/config';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Add timeout to fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(`${API_URL}/chatbot/upload-document`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
        },
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const errorMessage = data.detail || `Upload failed with status: ${response.status}`;
        console.error('Upload error:', errorMessage);
        return NextResponse.json({ error: errorMessage }, { status: response.status });
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload document';
    const status = error.name === 'AbortError' ? 504 : 500;
    
    return NextResponse.json(
      { error: errorMessage }, 
      { status }
    );
  }
}