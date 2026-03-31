export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { callAI, parseJSON } from '@/lib/ai-router';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeText, jobDescription } = body;
    if (!resumeText || !jobDescription) return NextResponse.json({ error: 'Resume and JD required' }, { status: 400 });

    // Truncate manually to avoid issues
    const rText = resumeText.slice(0, 4000);
    const jText = jobDescription.slice(0, 3000);

    console.log('AI Score: starting, resume len:', rText.length, 'jd len:', jText.length);

    const text = await callAI({
      tier: 'cheap',
      system: `You are an ATS scoring engine. Score this resume against the job description as Workday, Greenhouse, Lever, and iCIMS would. Return ONLY valid JSON, no markdown, no backticks:
{"overall_score":90,"ats_scores":{"workday":90,"greenhouse":91,"lever":89,"icims":90},"strengths":["strength1","strength2","strength3"],"improvements":["improvement1","improvement2"],"recruiter_impression":"Would shortlist - strong match"}`,
      user: `RESUME:\n${rText}\n\nJOB DESCRIPTION:\n${jText}\n\nScore this resume. Return ONLY JSON.`,
      maxTokens: 1500
    });

    console.log('AI Score: raw response length:', text?.length);
    const result = parseJSON(text);
    console.log('AI Score: parsed, overall:', result.overall_score);
    return NextResponse.json(result);
  } catch (e: any) {
    console.error('AI Score error:', e.message);
    return NextResponse.json({ error: e.message || 'Score failed' }, { status: 500 });
  }
}
