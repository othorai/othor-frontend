import { NextRequest, NextResponse } from 'next/server';
import { API_URL } from '@/lib/config';

export const dynamic = 'force-dynamic';

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