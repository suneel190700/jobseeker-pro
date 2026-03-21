export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url, currentDescription } = await request.json();
    
    // If we already have a good description, return it
    if (currentDescription && currentDescription.length > 500) {
      return NextResponse.json({ description: currentDescription });
    }

    if (!url || url === '#') {
      return NextResponse.json({ description: currentDescription || '' });
    }

    // Fetch the job posting page
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; JobSeekerBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return NextResponse.json({ description: currentDescription || '' });
    }

    const html = await res.text();
    
    // Extract text content from HTML
    let text = html
      // Remove scripts and styles
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      .replace(/<header[\s\S]*?<\/header>/gi, '')
      // Convert common elements to newlines
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<\/h[1-6]>/gi, '\n\n')
      // Remove all remaining HTML tags
      .replace(/<[^>]+>/g, ' ')
      // Decode HTML entities
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      // Clean up whitespace
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();

    // Try to find the job description section
    // Look for common patterns
    const jdPatterns = [
      /(?:job\s*description|about\s*(?:the\s*)?(?:role|job|position)|responsibilities|qualifications|requirements|what\s*you['']?ll?\s*do)([\s\S]{200,5000}?)(?:(?:apply|about\s*(?:us|the\s*company)|benefits|perks|equal\s*opportunity)|\n\n\n)/i,
      /(?:overview|summary)([\s\S]{200,5000}?)(?:(?:apply|about\s*(?:us|the\s*company)))/i,
    ];

    for (const pattern of jdPatterns) {
      const match = text.match(pattern);
      if (match && match[0].length > 200) {
        text = match[0];
        break;
      }
    }

    // If extracted text is much longer than needed, truncate smartly
    if (text.length > 8000) {
      text = text.slice(0, 8000);
    }

    // If we got meaningful content, return it; otherwise return original
    if (text.length > (currentDescription?.length || 0) + 100) {
      return NextResponse.json({ description: text, source: 'fetched' });
    }

    return NextResponse.json({ description: currentDescription || text, source: 'original' });
  } catch (error: any) {
    console.error('Fetch JD error:', error.message);
    return NextResponse.json({ description: '' });
  }
}
