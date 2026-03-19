export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromFile } from '@/lib/resume-parser';
import { analyzeResumeATS } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('resume') as File;
    const jobDescription = formData.get('jobDescription') as string;

    if (!file || !jobDescription) {
      return NextResponse.json(
        { error: 'Resume file and job description are required.' },
        { status: 400 }
      );
    }

    // Check API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'AI service not configured. Please add ANTHROPIC_API_KEY.' },
        { status: 503 }
      );
    }

    // Extract text from resume
    const buffer = Buffer.from(await file.arrayBuffer());
    const resumeText = await extractTextFromFile(buffer, file.type);

    if (!resumeText.trim()) {
      return NextResponse.json(
        { error: 'Could not extract text from resume. Try a different format.' },
        { status: 422 }
      );
    }

    // Run ATS analysis via Claude
    const rawAnalysis = await analyzeResumeATS(resumeText, jobDescription);

    // Parse JSON — handle potential markdown wrapping
    let analysis;
    try {
      const cleaned = rawAnalysis.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: 'AI returned an unexpected format. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('Resume analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze resume.' },
      { status: 500 }
    );
  }
}
