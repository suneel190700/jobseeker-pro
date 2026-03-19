export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromFile } from '@/lib/resume-parser';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('resume') as File;

    if (!file) {
      return NextResponse.json({ error: 'Resume file is required.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractTextFromFile(buffer, file.type);

    if (!text.trim()) {
      return NextResponse.json({ error: 'Could not extract text. Try a different format.' }, { status: 422 });
    }

    return NextResponse.json({ text, fileName: file.name });
  } catch (error: any) {
    console.error('Resume parse error:', error);
    return NextResponse.json({ error: 'Failed to parse resume.' }, { status: 500 });
  }
}
