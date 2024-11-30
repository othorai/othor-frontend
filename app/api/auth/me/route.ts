// app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/config';

export async function GET(request: Request) {
  try {
    console.log('Fetching user data from API');
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      console.log('No auth header found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${API_URL}/authorization/me`, {
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('User data fetch failed:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      return NextResponse.json(
        { error: errorData.detail || 'Failed to fetch user data' },
        { status: response.status }
      );
    }

    const userData = await response.json();

    // Fetch organization roles if user has organizations
    if (userData.organizations) {
      const orgRolesPromises = userData.organizations.map(async (org: any) => {
        const roleResponse = await fetch(
          `${API_URL}/api/v1/organizations/${org.id}/role`,
          {
            headers: {
              'Authorization': authHeader,
              'Accept': 'application/json',
            }
          }
        );
        const roleData = await roleResponse.json();
        return { ...org, role: roleData.role };
      });

      userData.organizations = await Promise.all(orgRolesPromises);
    }

    console.log('User data fetched successfully');
    return NextResponse.json(userData);
  } catch (error) {
    console.error('Server error in auth/me:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}