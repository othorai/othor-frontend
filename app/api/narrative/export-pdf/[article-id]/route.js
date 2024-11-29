import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/config';

export async function POST(request, { params }) {
  console.log('PDF Export API - Starting');
  try {
    // Get article ID from URL params
    const { articleId } = params;
    console.log('PDF Export API - Article ID:', articleId);

    // Get auth token from request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      console.log('PDF Export API - No auth token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get chart image from request body
    const { chartImage } = await request.json();
    console.log('PDF Export API - Chart image received:', !!chartImage);

    // Make request to backend
    console.log('PDF Export API - Making backend request');
    const response = await fetch(`${API_URL}/narrative/export-pdf-single`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/pdf'
      },
      body: JSON.stringify({
        article_id: articleId,
        chart_image: chartImage,
      })
    });

    console.log('PDF Export API - Backend response status:', response.status);

    if (!response.ok) {
      throw new Error(`Backend responded with status ${response.status}`);
    }

    // Get PDF data
    const pdfBuffer = await response.arrayBuffer();
    
    // Return PDF with appropriate headers
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="narrative-${articleId}.pdf"`,
      },
    });

  } catch (error) {
    console.error('PDF Export API - Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}