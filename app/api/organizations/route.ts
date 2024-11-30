// app/api/organizations/route.ts
import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/config';

export async function GET(request: Request) {
  try {
    console.log('Fetching organizations data');
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user organizations
    const response = await fetch(`${API_URL}/api/v1/organizations/`, {
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Organizations fetch failed:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      return NextResponse.json(
        { error: errorData.detail || 'Failed to fetch organizations' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // For each organization, fetch additional details like roles
    if (Array.isArray(data)) {
      const orgsWithDetails = await Promise.all(data.map(async (org) => {
        try {
          // Fetch role for this organization
          const roleResponse = await fetch(
            `${API_URL}/api/v1/organizations/${org.id}/role`,
            {
              headers: {
                'Authorization': authHeader,
                'Accept': 'application/json',
              }
            }
          );
          
          if (roleResponse.ok) {
            const roleData = await roleResponse.json();
            return {
              ...org,
              role: roleData.role
            };
          }
          return org;
        } catch (error) {
          console.error(`Error fetching details for organization ${org.id}:`, error);
          return org;
        }
      }));

      console.log('Organizations data fetched successfully');
      return NextResponse.json(orgsWithDetails);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Server error in organizations:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Handle POST request for creating new organization
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(`${API_URL}/api/v1/organizations/`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.detail || 'Failed to create organization' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Server error creating organization:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}