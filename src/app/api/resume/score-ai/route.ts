export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { callAI } from '@/lib/ai-router';

function safeParseJSON(text: string): any {
  // Clean common AI response issues
  let clean = text.trim();
  // Remove markdown backticks
  clean = clean.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  // Remove trailing commas before } or ]
  clean = clean.replace(/,\s*([}\]])/g, '$1');
  // Try parse
  try { return JSON.parse(clean); } catch {}
  // Try to find JSON object in response
  const match = clean.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch {}
    // Try fixing truncated JSON by closing brackets
    let attempt = match[0];
    const openBraces = (attempt.match(/\{/g) || []).length;
    const closeBraces = (attempt.match(/\}/g) || []).length;
    const openBrackets = (attempt.match(/\[/g) || []).length;
    const closeBrackets = (attempt.match(/\]/g) || []).length;
    for (let i = 0; i < openBrackets - closeBrackets; i++) attempt += ']';
    for (let i = 0; i < openBraces - closeBraces; i++) attempt += '}';
    // Remove trailing comma before added brackets
    attempt = attempt.replace(/,\s*([}\]])/g, '$1');
    try { return JSON.parse(attempt); } catch {}
  }
  throw new Error('Could not parse AI response as JSON');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeText, jobDescription } = body;
    if (!resumeText || !jobDescription) return NextResponse.json({ error: 'Resume and JD required' }, { status: 400 });

    const rText = resumeText.slice(0, 3000);
    const jText = jobDescription.slice(0, 2000);

    console.log('AI Score: starting, resume len:', rText.length, 'jd len:', jText.length);

    const text = await callAI({
      tier: 'cheap',
      system: `Score this resume against the job description. Return ONLY a JSON object, nothing else. No markdown. No explanation. Just JSON.`,
      user: `RESUME:\n${rText}\n\nJOB DESCRIPTION:\n${jText}\n\nReturn this exact JSON structure with real scores:\n{"overall_score":92,"ats_scores":{"workday":91,"greenhouse":93,"lever":90,"icims":92},"strengths":["str1","str2"],"improvements":["imp1","imp2"],"recruiter_impression":"one sentence"}`,
      maxTokens: 800
    });

    console.log('AI Score: raw length:', text?.length, 'first 200:', text?.slice(0, 200));
    const result = safeParseJSON(text);
    console.log('AI Score: parsed OK, overall:', result.overall_score);
    return NextResponse.json(result);
  } catch (e: any) {
    console.error('AI Score error:', e.message);
    return NextResponse.json({ error: e.message || 'Score failed' }, { status: 500 });
  }
}
