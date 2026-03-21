export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { callAI, parseJSON } from '@/lib/ai-router';

export async function POST(request: NextRequest) {
  try {
    const { resumeText, jobDescription, jobTitle, companyName, tone } = await request.json();
    if (!resumeText?.trim() || !jobDescription?.trim()) return NextResponse.json({ error: 'Resume and JD required.' }, { status: 400 });
    const toneGuide = tone === 'formal' ? 'Formal corporate tone.' : tone === 'enthusiastic' ? 'Enthusiastic but professional.' : 'Confident and professional.';
    const text = await callAI({ tier: 'cheap', system: `Expert cover letter writer. 3-4 paragraphs, under 400 words. ${toneGuide} No "I am writing to apply". No buzzwords. Use real metrics from resume. Return ONLY JSON: {"cover_letter":"full text","subject_line":"email subject"}`, user: `RESUME:\n${resumeText}\n\nJOB: ${jobTitle || 'the role'} at ${companyName || 'the company'}\n\nJD:\n${jobDescription}` });
    return NextResponse.json(parseJSON(text));
  } catch (error: any) { console.error('Cover letter error:', error); return NextResponse.json({ error: error.message || 'Failed.' }, { status: 500 }); }
}
