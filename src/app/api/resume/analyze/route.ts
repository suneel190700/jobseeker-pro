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
    const analysis = JSON.parse(rawAnalysis);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Resume analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze resume.' },
      { status: 500 }
    );
  }
}
