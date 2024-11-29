import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/config';

export async function POST(request, { params }) {
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { articleId, chartImage } = body;

    // Forward request to backend
    const response = await fetch(`${API_URL}/narrative/export-pdf-single`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
        'Accept': 'application/pdf'
      },
      body: JSON.stringify({
        article_id: articleId,
        chart_image: chartImage
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate PDF');
    }

    // Get the PDF buffer
    const pdfBuffer = await response.arrayBuffer();

    // Return PDF with proper headers
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="narrative-${articleId}.pdf"`,
      },
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}