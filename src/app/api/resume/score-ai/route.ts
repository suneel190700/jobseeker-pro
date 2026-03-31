export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { callAI, parseJSON, smartTruncate } from '@/lib/ai-router';

export async function POST(request: NextRequest) {
  try {
    const { resumeText, jobDescription } = await request.json();
    if (!resumeText || !jobDescription) return NextResponse.json({ error: 'Resume and JD required' }, { status: 400 });

    const text = await callAI({
      tier: 'cheap',
      system: `Act as an ATS scoring engine simulating Workday, Greenhouse, Lever, and iCIMS. Analyze the resume against the job description. Be accurate and realistic. Score 90-95 only if resume truly matches well. Return ONLY valid JSON:
{"overall_score":number,"ats_scores":{"workday":number,"greenhouse":number,"lever":number,"icims":number},"keyword_match":{"matched":["keyword"],"missing":["keyword"],"match_percentage":number},"strengths":["strength1","strength2"],"improvements":["fix1","fix2"],"recruiter_impression":"one sentence - would a recruiter shortlist this?"}`,
      user: `RESUME:\n${smartTruncate(resumeText, 3000)}\n\nJOB DESCRIPTION:\n${smartTruncate(jobDescription, 2000)}`,
      maxTokens: 2000
    });

    return NextResponse.json(parseJSON(text));
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
