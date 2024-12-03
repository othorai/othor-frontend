// app/api/organizations/[orgId]/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { API_URL } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  const orgId = params.orgId;
  
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock data for development
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json([
        {
          id: '1',
          email: 'user1@example.com',
          username: 'User One',
          is_admin: true
        },
        {
          id: '2',
          email: 'user2@example.com',
          username: 'User Two',
          is_admin: false
        }
      ]);
    }

    const response = await fetch(
      `${API_URL}/api/v1/organizations/${orgId}/users`,
      {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
        },
        next: { revalidate: 0 }
      }
    );

    // Log the response details for debugging
    console.log('API Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', errorData);
      return NextResponse.json(
        { error: `Failed to fetch users: ${response.status}`, details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in users API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team members', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  const orgId = params.orgId;

  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Received request body:', body);

    const response = await fetch(
      `${API_URL}/api/v1/organizations/${orgId}/users`,
      {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      }
    );

    // Log the response details for debugging
    console.log('API Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', errorData);
      return NextResponse.json(
        { error: `Failed to add user: ${response.status}`, details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error adding team member:', error);
    return NextResponse.json(
      { error: 'Failed to add team member', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { orgId: string; userId: string } }
) {
  const { orgId, userId } = params;

  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(
      `${API_URL}/api/v1/organizations/${orgId}/users/${userId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': authHeader,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: `Failed to remove user: ${response.status}`, details: errorData },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing team member:', error);
    return NextResponse.json(
      { error: 'Failed to remove team member', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}