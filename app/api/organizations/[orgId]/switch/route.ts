// app/api/organizations/[orgId]/switch/route.ts
import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/config';

export async function POST(
  request: Request,
  { params }: { params: { orgId: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First, log the request details for debugging
    console.log('Switching to organization:', params.orgId);
    console.log('API URL:', `${API_URL}/authorization/switch-organization/${params.orgId}`);

    const response = await fetch(
      `${API_URL}/authorization/switch-organization/${params.orgId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        // Add empty body if required by your API
        body: JSON.stringify({}),
      }
    );

    // Log the response status and headers for debugging
    console.log('Switch org response status:', response.status);
    console.log('Switch org response headers:', Object.fromEntries(response.headers));

    // Try to get the response text first for debugging
    const responseText = await response.text();
    console.log('Raw response:', responseText);

    // Try to parse the response as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      return NextResponse.json(
        { error: 'Invalid response from server' },
        { status: 500 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'Failed to switch organization' },
        { status: response.status }
      );
    }

    // Return the successful response
    return NextResponse.json({
      access_token: data.access_token,
      message: 'Organization switched successfully'
    });

  } catch (error) {
    console.error('Server error in organization switch:', error);
    return NextResponse.json(
      { 
        error: 'Failed to switch organization',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}