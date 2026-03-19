export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromFile } from '@/lib/resume-parser';
import { analyzeResumeATS } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'AI service not configured. Add ANTHROPIC_API_KEY.' }, { status: 503 });
    }

    let resumeText: string;
    let jobDescription: string;

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      // JSON body — base resume text sent directly
      const body = await request.json();
      resumeText = body.resumeText;
      jobDescription = body.jobDescription;
    } else {
      // FormData — file upload
      const formData = await request.formData();
      const file = formData.get('resume') as File;
      jobDescription = formData.get('jobDescription') as string;

      if (!file) {
        return NextResponse.json({ error: 'Resume file is required.' }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      resumeText = await extractTextFromFile(buffer, file.type);
    }

    if (!resumeText?.trim()) {
      return NextResponse.json({ error: 'Could not extract text from resume.' }, { status: 422 });
    }
    if (!jobDescription?.trim()) {
      return NextResponse.json({ error: 'Job description is required.' }, { status: 400 });
    }

    const rawAnalysis = await analyzeResumeATS(resumeText, jobDescription);

    let analysis;
    try {
      const cleaned = rawAnalysis.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: 'AI returned unexpected format. Please try again.' }, { status: 500 });
    }

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('Resume analysis error:', error);
    return NextResponse.json({ error: error.message || 'Failed to analyze resume.' }, { status: 500 });
  }
}
