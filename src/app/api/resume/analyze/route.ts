export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromFile } from '@/lib/resume-parser';
import { callAI, parseJSON } from '@/lib/ai-router';

const PROMPT = `You are an expert ATS specialist. Analyze the resume against the job description. Return ONLY valid JSON:
{"overall_score":<0-100>,"score_summary":"one sentence strengths","score_weakness":"one sentence biggest gap","keyword_match":{"matched":["kw"],"missing":["kw"],"partial":["kw"],"match_percentage":<0-100>},"category_scores":[{"category":"ATS Keywords","score":<0-10>,"explanation":"...","fixes":["..."]},{"category":"Bullet Impact","score":<0-10>,"explanation":"...","fixes":["..."]},{"category":"Quantification","score":<0-10>,"explanation":"...","fixes":["..."]},{"category":"Technical Depth","score":<0-10>,"explanation":"...","fixes":["..."]},{"category":"Career Progression","score":<0-10>,"explanation":"...","fixes":["..."]},{"category":"Format & ATS","score":<0-10>,"explanation":"...","fixes":["..."]},{"category":"Summary","score":<0-10>,"explanation":"...","fixes":["..."]},{"category":"First Impression","score":<0-10>,"explanation":"...","fixes":["..."]}],"priority_fixes":[{"rank":1,"section":"...","action":"..."}],"weak_bullets":[{"original":"...","rewritten":"...","reason":"..."}]}
Score honestly (50-75 typical). 5 priority fixes. Up to 10 weak bullets. No markdown.`;

export async function POST(request: NextRequest) {
  try {
    let resumeText: string, jobDescription: string;
    const ct = request.headers.get('content-type') || '';
    if (ct.includes('application/json')) { const b = await request.json(); resumeText = b.resumeText; jobDescription = b.jobDescription; }
    else { const fd = await request.formData(); const f = fd.get('resume') as File; jobDescription = fd.get('jobDescription') as string; if (!f) return NextResponse.json({ error: 'Resume required.' }, { status: 400 }); resumeText = await extractTextFromFile(Buffer.from(await f.arrayBuffer()), f.type); }
    if (!resumeText?.trim()) return NextResponse.json({ error: 'Could not extract text.' }, { status: 422 });
    if (!jobDescription?.trim()) return NextResponse.json({ error: 'Job description required.' }, { status: 400 });

    const text = await callAI({ tier: 'cheap', system: PROMPT, user: `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}`, maxTokens: 8000 });
    try { return NextResponse.json(parseJSON(text)); } catch (parseErr) {
      console.error('JSON parse failed, retrying...', parseErr);
      // Retry once with explicit instruction
      const text2 = await callAI({ tier: 'cheap', system: PROMPT + '\n\nCRITICAL: Return ONLY a single valid JSON object. No text before or after. Keep response under 4000 tokens.', user: `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}`, maxTokens: 8000 });
      return NextResponse.json(parseJSON(text2));
    }
  } catch (error: any) { console.error('Analyze error:', error); return NextResponse.json({ error: error.message || 'Failed.' }, { status: 500 }); }
}
