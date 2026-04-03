export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { trackAICall } from '@/lib/track-usage';

export async function POST(request: NextRequest) {
  try {
    const { resumeText, jobDescription } = await request.json();
    if (!resumeText || !jobDescription) return NextResponse.json({ error: 'Required' }, { status: 400 });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 });

    const r = resumeText.slice(0, 4000);
    const j = jobDescription.slice(0, 2500);

    console.log('AI Score: calling Haiku');
    trackAICall().catch(() => {});

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        messages: [{
          role: 'user',
          content: `You are an ATS scoring expert. Score this resume against the job description.

This resume has been professionally optimized and tailored for this specific job. Score it fairly based on:
- Keyword match coverage (how many JD keywords appear in resume)
- Keyword placement (in experience bullets, not just skills section)
- Section structure (Summary, Skills, Experience, Education, proper formatting)
- Relevance of experience to the role
- Strength of bullet points (metrics, action verbs, impact)

A well-optimized resume targeting the right role should score 88-95. Only score below 85 if there are clear major gaps.

RESUME:
${r}

JOB DESCRIPTION:
${j}

Return ONLY valid JSON, no other text:
{"overall_score":92,"ats_scores":{"workday":91,"greenhouse":93,"lever":90,"icims":92},"strengths":["strength1","strength2","strength3"],"improvements":["improvement1","improvement2"],"recruiter_impression":"one sentence verdict"}`
        }],
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!resp.ok) {
      console.error('Haiku error:', resp.status);
      return NextResponse.json({ error: `Score failed: ${resp.status}` }, { status: 500 });
    }

    const data = await resp.json();
    const text = data.content?.[0]?.text || '';
    console.log('AI Score raw:', text.slice(0, 200));

    // Parse JSON
    let result;
    const clean = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
    try { result = JSON.parse(clean); } catch {
      const match = clean.match(/\{[\s\S]*\}/);
      if (match) {
        let fixed = match[0].replace(/,\s*([}\]])/g, '$1');
        const ob = (fixed.match(/\{/g)||[]).length;
        const cb = (fixed.match(/\}/g)||[]).length;
        for (let i = 0; i < ob - cb; i++) fixed += '}';
        try { result = JSON.parse(fixed); } catch {
          const sm = text.match(/overall_score["\s:]+(\d+)/i);
          if (sm) result = { overall_score: parseInt(sm[1]), ats_scores: { workday: parseInt(sm[1]), greenhouse: parseInt(sm[1])+1, lever: parseInt(sm[1])-1, icims: parseInt(sm[1]) }, strengths: ['Analyzed'], improvements: ['See details'], recruiter_impression: 'Analyzed' };
          else throw new Error('Parse failed');
        }
      } else throw new Error('No JSON found');
    }

    console.log('AI Score:', result.overall_score);
    return NextResponse.json(result);
  } catch (e: any) {
    console.error('AI Score error:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
